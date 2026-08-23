/* Hamster of Orion — fleets, movement, range (manual: Fleet Movement, Colony Transports) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var PARSEC = function () { return HOO.Galaxy.PARSEC; };

  function newFleet(g, empId, atStar) {
    var f = {
      id: g.fleetSeq++, empire: empId,
      at: atStar, from: null, to: null,
      x: g.stars[atStar].x, y: g.stars[atStar].y,
      ships: [0, 0, 0, 0, 0, 0],
      retreating: false,
      bombardedYear: 0
    };
    g.fleets.push(f);
    return f;
  }

  function fleetAt(g, empId, starId) {
    for (var i = 0; i < g.fleets.length; i++) {
      var f = g.fleets[i];
      if (f.empire === empId && f.at === starId) return f;
    }
    return null;
  }

  function fleetsAt(g, starId) {
    return g.fleets.filter(function (f) { return f.at === starId; });
  }

  function addShips(g, empId, starId, slot, count) {
    var f = fleetAt(g, empId, starId) || newFleet(g, empId, starId);
    f.ships[slot] += count;
    return f;
  }

  function shipCount(f) { return f.ships.reduce(function (a, b) { return a + b; }, 0); }

  function cleanup(g) {
    g.fleets = g.fleets.filter(function (f) { return shipCount(f) > 0; });
  }

  // fleet speed = slowest ship design warp; nebulas clamp to 1
  function fleetWarp(g, f) {
    var emp = g.empires[f.empire];
    var w = 99;
    f.ships.forEach(function (n, slot) {
      if (n > 0 && emp.designs[slot]) w = Math.min(w, emp.designs[slot].warp);
    });
    return w === 99 ? 1 : w;
  }

  // fuel range: distance from nearest own (or allied) colony
  function rangeFrom(g, emp, x, y) {
    var best = Infinity;
    g.stars.forEach(function (s) {
      if (!s.planet || !s.planet.colony) return;
      var ce = s.planet.colony.empire;
      var ok = ce === emp.id;
      if (!ok && emp.relations[ce] && emp.relations[ce].treaty === 'alliance') ok = true;
      if (ok) best = Math.min(best, U.dist(x, y, s.x, s.y) / PARSEC());
    });
    return best;
  }

  function inRange(g, emp, destStar, fleet) {
    var extra = 0;
    if (fleet) {
      extra = 3;
      fleet.ships.forEach(function (n, slot) {
        if (n > 0 && emp.designs[slot]) extra = Math.min(extra, emp.designs[slot].extraRange);
      });
    }
    var d = rangeFrom(g, emp, destStar.x, destStar.y);
    return d <= emp.derived.range + extra + 0.001;
  }

  // split `counts` ships off a fleet in orbit and send to star
  function sendFleet(g, empId, fromStarId, toStarId, counts) {
    var emp = g.empires[empId];
    var src = fleetAt(g, empId, fromStarId);
    if (!src) return null;
    var from = g.stars[fromStarId], to = g.stars[toStarId];

    var moving = [0, 0, 0, 0, 0, 0];
    var any = false;
    for (var i = 0; i < 6; i++) {
      var n = Math.min(counts[i] || 0, src.ships[i]);
      if (n > 0) { moving[i] = n; any = true; }
    }
    if (!any) return null;
    if (fromStarId === toStarId) return null;

    // stargate jump: both ends have gates
    var gateFrom = from.planet && from.planet.colony && from.planet.colony.empire === empId && from.planet.colony.stargate;
    var gateTo = to.planet && to.planet.colony && to.planet.colony.empire === empId && to.planet.colony.stargate;

    for (i = 0; i < 6; i++) src.ships[i] -= moving[i];

    var f = {
      id: g.fleetSeq++, empire: empId,
      at: null, from: fromStarId, to: toStarId,
      x: from.x, y: from.y,
      ships: moving, retreating: false,
      gateJump: !!(gateFrom && gateTo),
      bombardedYear: src.bombardedYear || 0
    };
    g.fleets.push(f);
    cleanup(g);
    return f;
  }

  // ships produced with relocation orders
  function sendNewShips(g, empId, fromStarId, toStarId, slot, count) {
    var counts = [0, 0, 0, 0, 0, 0];
    counts[slot] = count;
    addShips(g, empId, fromStarId, slot, count);
    return sendFleet(g, empId, fromStarId, toStarId, counts);
  }

  // nebula-aware travel time from an arbitrary point: simulates the same yearly
  // steps moveFleets/moveTransports take (warp clamps to 1 while inside a nebula)
  function travelYears(g, fromX, fromY, warp, toX, toY) {
    var x = fromX, y = fromY, years = 0;
    while (years < 500) {
      years++;
      var w = inNebula(g, x, y) ? 1 : warp;
      var step = w * PARSEC();
      var d = U.dist(x, y, toX, toY);
      if (step >= d) return years;
      x += (toX - x) / d * step;
      y += (toY - y) / d * step;
    }
    return years;
  }

  function eta(g, f) {
    if (f.at !== null) return 0;
    if (f.gateJump) return 1;
    var to = g.stars[f.to];
    return travelYears(g, f.x, f.y, fleetWarp(g, f), to.x, to.y);
  }

  // advance all fleets one year; returns list of arrival events
  function moveFleets(g) {
    var arrivals = [];
    g.fleets.forEach(function (f) {
      if (f.at !== null) return;
      var to = g.stars[f.to];
      var warp = fleetWarp(g, f);
      // nebula check at current position
      if (inNebula(g, f.x, f.y)) warp = 1;
      var step = warp * PARSEC();
      var d = U.dist(f.x, f.y, to.x, to.y);
      if (f.gateJump || step >= d) {
        f.x = to.x; f.y = to.y; f.at = f.to; f.from = null; f.to = null; f.gateJump = false;
        f.retreating = false; // retreat jump completed; fleet may take orders again
        // merge with existing orbiting fleet
        var other = null;
        for (var i = 0; i < g.fleets.length; i++) {
          var o = g.fleets[i];
          if (o !== f && o.empire === f.empire && o.at === f.at) { other = o; break; }
        }
        if (other) {
          for (i = 0; i < 6; i++) other.ships[i] += f.ships[i];
          if (f.bombardedYear === g.year || other.bombardedYear === g.year) other.bombardedYear = g.year;
          f.ships = [0, 0, 0, 0, 0, 0];
          arrivals.push({ fleet: other, star: g.stars[other.at] });
        } else {
          arrivals.push({ fleet: f, star: g.stars[f.at] });
        }
      } else {
        f.x += (to.x - f.x) / d * step;
        f.y += (to.y - f.y) / d * step;
      }
    });
    cleanup(g);
    return arrivals;
  }

  // manual (Retreating): a fleet that fled combat must complete its jump to the
  // friendly colony before it can accept new orders, hypercomm or not
  function canRedirect(g, f) {
    return f.at === null && !f.retreating;
  }

  // hyperspace comms mid-flight redirect; enforces the retreat lock and fuel range
  function redirectFleet(g, empId, f, toStarId) {
    if (f.at !== null || f.empire !== empId) return false;
    if (f.retreating) return false;
    var emp = g.empires[empId];
    var dest = g.stars[toStarId];
    if (!dest || !inRange(g, emp, dest, f)) return false;
    f.to = toStarId;
    f.gateJump = false; // a redirected jump is a normal flight, not a gate hop
    return true;
  }

  function inNebula(g, x, y) {
    for (var i = 0; i < g.nebulas.length; i++) {
      var nb = g.nebulas[i];
      var dx = x - nb.x, dy = y - nb.y;
      var ca = Math.cos(-nb.rot), sa = Math.sin(-nb.rot);
      var lx = dx * ca - dy * sa, ly = dx * sa + dy * ca;
      if ((lx * lx) / (nb.rx * nb.rx) + (ly * ly) / (nb.ry * nb.ry) <= 1) return true;
    }
    return false;
  }

  // ---------- colony transports ----------
  function sendTransports(g, empId, fromStarId, toStarId, pop) {
    var emp = g.empires[empId];
    var from = g.stars[fromStarId], to = g.stars[toStarId];
    var c = from.planet.colony;
    if (!c || c.empire !== empId) return false;
    if (c.quarantine) return false;
    pop = Math.min(pop, Math.floor(c.pop / 2) - c.transported);
    if (pop <= 0) return false;
    c.pop -= pop;
    c.transported += pop;
    var warp = Math.max(1, emp.derived.warp - 1);
    g.transports.push({
      empire: empId, from: fromStarId, to: toStarId, pop: pop,
      x: from.x, y: from.y, warp: warp
    });
    return true;
  }

  function moveTransports(g) {
    var landings = [];
    g.transports = g.transports.filter(function (t) {
      var to = g.stars[t.to];
      var warp = inNebula(g, t.x, t.y) ? 1 : t.warp;
      var step = warp * PARSEC();
      var d = U.dist(t.x, t.y, to.x, to.y);
      if (step >= d) { landings.push(t); return false; }
      t.x += (to.x - t.x) / d * step;
      t.y += (to.y - t.y) / d * step;
      return true;
    });
    return landings;
  }

  // what an empire can see (for map rendering & contact)
  function scannerSees(g, emp, x, y) {
    var d = emp.derived;
    var cols = HOO.Colony.colonies(g, emp.id);
    for (var i = 0; i < cols.length; i++) {
      if (U.dist(x, y, cols[i].star.x, cols[i].star.y) / PARSEC() <= d.scanRange) return true;
    }
    if (d.shipScanRange > 0) {
      for (i = 0; i < g.fleets.length; i++) {
        var f = g.fleets[i];
        if (f.empire === emp.id && U.dist(x, y, f.x, f.y) / PARSEC() <= d.shipScanRange) return true;
      }
    }
    return false;
  }

  HOO.Fleet = {
    newFleet: newFleet, fleetAt: fleetAt, fleetsAt: fleetsAt, addShips: addShips,
    shipCount: shipCount, cleanup: cleanup, fleetWarp: fleetWarp,
    rangeFrom: rangeFrom, inRange: inRange, sendFleet: sendFleet, sendNewShips: sendNewShips,
    eta: eta, travelYears: travelYears, moveFleets: moveFleets, inNebula: inNebula,
    canRedirect: canRedirect, redirectFleet: redirectFleet,
    sendTransports: sendTransports, moveTransports: moveTransports, scannerSees: scannerSees
  };
})();
