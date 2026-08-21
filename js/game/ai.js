/* Hamster of Orion — AI empires (manual: The Alien Leaders) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  // ---------- main per-turn planning ----------
  function planTurn(g, emp) {
    if (emp.dead || emp.isPlayer) return;
    manageDesigns(g, emp);
    manageResearch(g, emp);
    manageExpansion(g, emp);   // sets wantColonyShip/wantScouts before allocations read them
    manageColonies(g, emp);
    manageReserve(g, emp);
    manageTransports(g, emp);
    manageWar(g, emp);
    manageGuardian(g, emp);
    manageDiplomacy(g, emp);
    manageSpies(g, emp);
  }

  // ---------- research ----------
  function manageResearch(g, emp) {
    var obj = HOO.DATA.OBJECTIVES[emp.objective];
    var alloc = {};
    var total = 0;
    HOO.CONST.FIELDS.forEach(function (f) {
      var w = (obj.research[f] || 1) * (0.8 + U.rand() * 0.4);
      // early game: propulsion matters (range), planetology (colonization)
      if (g.turn < 60 && (f === 'propulsion' || f === 'planetology')) w *= 1.5;
      alloc[f] = w; total += w;
    });
    HOO.CONST.FIELDS.forEach(function (f) {
      emp.research.alloc[f] = Math.round(alloc[f] / total * 100);
    });
    HOO.Research.ensureProjects(emp);
    // pick preferred choices when multiple
    HOO.CONST.FIELDS.forEach(function (f) {
      var pr = emp.research.projects[f];
      if (pr && pr.invested === 0) {
        var ch = HOO.Research.choices(emp, f);
        if (ch.length > 1) {
          // militarists take weapons/shields; expansionists take range/colonize etc.
          var pickT = ch[0];
          ch.forEach(function (t) {
            if (emp.objective === 'expansionist' && (t.effect.type === 'range' || t.effect.type === 'colonize' || t.effect.type === 'engine')) pickT = t;
            if (emp.objective === 'militarist' && (t.effect.type === 'weapon' || t.effect.type === 'shield')) pickT = t;
            if (emp.objective === 'industrialist' && (t.effect.type === 'robotic' || t.effect.type === 'industrial')) pickT = t;
            if (emp.objective === 'ecologist' && (t.effect.type === 'eco' || t.effect.type === 'terraform' || t.effect.type === 'soil')) pickT = t;
          });
          if (pickT.id !== pr.techId) HOO.Research.startProject(emp, f, pickT.id);
        }
      }
    });
  }

  // ---------- ship designs ----------
  function slotOf(emp, pred) {
    for (var i = 0; i < 6; i++) if (emp.designs[i] && pred(emp.designs[i])) return i;
    return -1;
  }
  function freeSlot(emp) {
    for (var i = 0; i < 6; i++) if (!emp.designs[i]) return i;
    return -1;
  }
  // scouts are found by role or shape, never by a hard-coded slot number
  function scoutSlotOf(emp) {
    var s = slotOf(emp, function (d) { return d.role === 'scout' || (d.extraRange > 0 && !d.hasColonyBase); });
    if (s >= 0) return s;
    return slotOf(emp, function (d) { return d.hullId === 'small' && !d.weapons.length && !d.hasColonyBase; });
  }

  // special systems worth mounting on warships, roughly cheapest-first
  var SPECIAL_PREF = ['battleScanner', 'lightning', 'zyro', 'antiMissile', 'advDamControl', 'autoRepair',
    'inertialNull', 'inertialStab', 'heFocus', 'repulsor', 'cloak', 'oracle', 'warpDissipator',
    'teleporter', 'stasis', 'ionicPulsar', 'pulsar', 'blackHole'];
  // devices that fill the same role: mount only the best of each group
  var SPECIAL_GROUP = {
    lightning: 'md', zyro: 'md', antiMissile: 'md',
    advDamControl: 'rep', autoRepair: 'rep',
    inertialNull: 'in', inertialStab: 'in',
    ionicPulsar: 'pu', pulsar: 'pu'
  };

  // mount the most useful special systems that still fit the hull
  function mountSpecials(emp, spec, design, maxCount) {
    var SD = HOO.ShipDesign;
    var known = SD.specials(emp);
    var used = {};
    var best = design;
    SPECIAL_PREF.forEach(function (key) {
      if (spec.specials.length >= maxCount) return;
      var grp = SPECIAL_GROUP[key] || key;
      if (used[grp]) return;
      var t = null;
      known.forEach(function (k) { if (k.effect.special === key) t = k; });
      if (!t) return;
      spec.specials.push(t.id);
      var d = SD.compute(emp, spec);
      if (d && d.valid) { best = d; used[grp] = true; }
      else spec.specials.pop();
    });
    return best;
  }

  function manageDesigns(g, emp) {
    if (g.turn % 8 !== emp.id % 8) return; // stagger redesign work

    var SD = HOO.ShipDesign;
    var eng = SD.bestOf(emp, SD.engines(emp));
    var comp = SD.bestOf(emp, SD.computers(emp));
    var shld = SD.bestOf(emp, SD.shields(emp));
    var ecm = SD.bestOf(emp, SD.ecms(emp));
    var arm = SD.bestOf(emp, SD.armors(emp));
    if (!eng || !arm) return;

    var weapons = SD.weapons(emp);
    var beams = weapons.filter(function (t) { return t.effect.wclass === 'beam' || t.effect.wclass === 'heavy'; });
    var missiles = weapons.filter(function (t) { return t.effect.wclass === 'missile'; });
    var bombs = weapons.filter(function (t) { return t.effect.wclass === 'bomb'; });
    var bestBeam = beams.length ? beams[beams.length - 1] : null;
    var bestMissile = missiles.length ? missiles[missiles.length - 1] : null;
    var bestBomb = bombs.length ? bombs[bombs.length - 1] : null;

    // ensure a colony ship design exists, and refit it with newer engines as they arrive
    var colSlot = slotOf(emp, function (d) { return d.hasColonyBase; });
    if (colSlot < 0) {
      var fs = freeSlot(emp);
      if (fs < 0) { scrapWorst(g, emp); fs = freeSlot(emp); }
      if (fs >= 0) {
        emp.designs[fs] = SD.compute(emp, {
          name: 'Colony Ship', hullId: 'large', engineId: eng.id, computerId: null,
          shieldId: null, ecmId: null, armorId: arm.id, doubleArmor: false,
          weapons: [], specials: ['colony_base']
        });
      }
    } else if (emp.designs[colSlot] && (eng.effect.warp > emp.designs[colSlot].warp ||
      (emp.designs[colSlot].colonyHostility !== undefined &&
        emp.designs[colSlot].colonyHostility < emp.derived.maxHostility))) {
      // refresh on newer engines OR when controlled-environment tech outgrows
      // the frozen base module (a stale ship can't settle newly reachable worlds)
      var colNew = SD.compute(emp, {
        name: 'Colony Ship', hullId: 'large', engineId: eng.id, computerId: null,
        shieldId: null, ecmId: null, armorId: arm.id, doubleArmor: false,
        weapons: [], specials: ['colony_base']
      });
      if (colNew && colNew.valid) emp.designs[colSlot] = colNew;
    }

    // keep a scout design on the books so exploration never eats warships
    if (scoutSlotOf(emp) < 0) {
      var fsS = freeSlot(emp);
      if (fsS >= 0) {
        var rft = null;
        SD.specials(emp).forEach(function (t) { if (t.effect.special === 'reserveFuel') rft = t; });
        var sd = SD.compute(emp, {
          name: 'Scout', hullId: 'small', engineId: eng.id, computerId: null, shieldId: null,
          ecmId: null, armorId: arm.id, doubleArmor: false, weapons: [], specials: rft ? [rft.id] : []
        });
        if (sd && sd.valid) { sd.role = 'scout'; emp.designs[fsS] = sd; }
      }
    }

    // main warship: refresh when tech has moved on
    var age = emp.designAge || 0;
    var conLv = HOO.State.techLevel(emp, 'construction');
    var hullId = conLv > 30 ? 'huge' : (conLv > 14 ? 'large' : 'medium');
    var warSlot = slotOf(emp, function (d) { return d.role === 'war'; });
    var wantNew = warSlot < 0;
    if (!wantNew && warSlot >= 0) {
      var cur = emp.designs[warSlot];
      var curBest = cur.weapons.length ? HOO.DATA.techById[cur.weapons[0].id].level : 0;
      if (bestBeam && bestBeam.level > curBest + 6) wantNew = true;
      if (bestMissile && bestMissile.level > curBest + 8) wantNew = true;
      if (cur.hullId !== hullId) wantNew = true; // construction unlocked a bigger hull
    }
    if (wantNew && (bestBeam || bestMissile)) {
      var fs2 = freeSlot(emp);
      if (fs2 < 0) { scrapWorst(g, emp); fs2 = freeSlot(emp); }
      if (fs2 >= 0) {
        var spec = {
          name: U.pick(HOO.DATA.SHIP_NAMES[hullId]), hullId: hullId,
          engineId: eng.id, computerId: comp ? comp.id : null,
          shieldId: shld ? shld.id : null, ecmId: ecm ? ecm.id : null,
          armorId: arm.id, doubleArmor: false, weapons: [], specials: []
        };
        // fill weapons greedily to fit
        var wl = [];
        if (bestBeam) wl.push({ id: bestBeam.id, count: 1 });
        if (bestMissile) wl.push({ id: bestMissile.id, count: 1 });
        spec.weapons = wl;
        var d2 = SD.compute(emp, spec);
        if (d2 && d2.valid) {
          // mount special devices first, then scale weapon counts to fill space
          d2 = mountSpecials(emp, spec, d2, hullId === 'huge' ? 3 : 2);
          var guard = 0;
          while (guard++ < 60) {
            var grew = false;
            for (var wi = 0; wi < spec.weapons.length; wi++) {
              spec.weapons[wi].count++;
              var d3 = SD.compute(emp, spec);
              if (d3 && d3.valid) { d2 = d3; grew = true; }
              else spec.weapons[wi].count--;
            }
            if (!grew) break;
          }
          d2.role = 'war';
          emp.designs[fs2] = d2;
        }
      }
    }

    // bomber when at war
    var atWar = g.empires.some(function (o) { return !o.dead && o.id !== emp.id && emp.relations[o.id].war; });
    if (atWar && bestBomb && slotOf(emp, function (d) { return d.role === 'bomber'; }) < 0) {
      var fs3 = freeSlot(emp);
      if (fs3 < 0) { scrapWorst(g, emp); fs3 = freeSlot(emp); }
      if (fs3 >= 0) {
        var bspec = {
          name: 'Bomber', hullId: 'medium', engineId: eng.id, computerId: comp ? comp.id : null,
          shieldId: shld ? shld.id : null, ecmId: ecm ? ecm.id : null, armorId: arm.id,
          doubleArmor: false, weapons: [{ id: bestBomb.id, count: 2 }], specials: []
        };
        var bd = SD.compute(emp, bspec);
        if (bd && bd.valid) bd = mountSpecials(emp, bspec, bd, 1);
        var guard2 = 0;
        while (bd && bd.valid && guard2++ < 40) {
          bspec.weapons[0].count++;
          var bd2 = SD.compute(emp, bspec);
          if (bd2 && bd2.valid) bd = bd2; else { bspec.weapons[0].count--; break; }
        }
        if (bd && bd.valid) { bd.role = 'bomber'; emp.designs[fs3] = bd; }
      }
    }
  }

  function scrapWorst(g, emp) {
    // scrap the non-colony design with the least invested value;
    // spare the scout unless it is the only thing left to scrap
    var worst = -1, worstScore = Infinity;
    var scout = -1, scoutScore = Infinity;
    for (var i = 0; i < 6; i++) {
      var d = emp.designs[i];
      if (!d || d.hasColonyBase) continue;
      var count = 0;
      g.fleets.forEach(function (f) { if (f.empire === emp.id) count += f.ships[i]; });
      var score = count * d.cost;
      if (d.role === 'scout' || d.extraRange > 0) {
        if (score < scoutScore) { scoutScore = score; scout = i; }
        continue;
      }
      if (score < worstScore) { worstScore = score; worst = i; }
    }
    if (worst < 0) worst = scout;
    if (worst >= 0) HOO.ShipDesign.scrapDesign(g, emp, worst);
  }

  // ---------- colony allocations ----------
  function manageColonies(g, emp) {
    var diff = HOO.CONST.DIFFICULTIES[g.difficulty];
    var atWar = g.empires.some(function (o) { return !o.dead && o.id !== emp.id && emp.relations[o.id].war; });
    var wantColonyShip = emp.wantColonyShip;
    var obj = HOO.DATA.OBJECTIVES[emp.objective];

    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      var c = e.colony, star = e.star;
      var d = emp.derived;
      var mp = HOO.Colony.maxPop(emp, star);
      var maxFact = mp * Math.min(d.controls, c.controls);
      var a = { ship: 0, def: 0, ind: 0, eco: 10, tech: 0 };

      // ecology need: keep clean (same shared formula as engine & UI)
      a.eco = U.clamp(HOO.Colony.ecoMinPct(emp, star) + 2, 4, 60);
      if (HOO.DATA.raceById[emp.raceId].wasteImmune) a.eco = 4;

      if (c.factories < maxFact * 0.9) {
        a.ind = Math.max(0, 100 - a.eco - 10);
        a.tech = 10;
      } else {
        // developed: research + defense + ships
        var shipShare = atWar ? 45 : (obj.fleetHunger ? 25 : 12);
        var defShare = atWar ? 15 : 8;
        if (c.bases >= 6 + (atWar ? 6 : 0)) defShare = 0;
        var indShare = c.factories < maxFact ? 10 : 0;
        a.ship = shipShare; a.def = defShare; a.ind = indShare;
        a.tech = 0; // remainder flows into research in normalizeAlloc
      }

      // building choice: colony ships from the biggest colony
      if (wantColonyShip && star.id === biggestColony(g, emp)) {
        var colSlot = slotOf(emp, function (dd) { return dd.hasColonyBase; });
        if (colSlot >= 0) {
          c.buildDesign = colSlot;
          // the colony ship takes priority: squeeze def/ind/tech into what remains
          a.ship = Math.min(Math.max(a.ship, 40), 100 - a.eco);
          var room = 100 - a.eco - a.ship;
          var rest = a.def + a.ind + a.tech;
          if (rest > room) {
            a.def = Math.floor(a.def * room / Math.max(1, rest));
            a.ind = Math.floor(a.ind * room / Math.max(1, rest));
            a.tech = Math.max(0, room - a.def - a.ind);
          }
        }
      } else {
        var warSlot = slotOf(emp, function (dd) { return dd.role === 'war'; });
        var bomberSlot = slotOf(emp, function (dd) { return dd.role === 'bomber'; });
        var scoutSlot = scoutSlotOf(emp);
        if (emp.wantScouts && scoutSlot >= 0 && U.chance(0.2)) c.buildDesign = scoutSlot;
        else if (atWar && bomberSlot >= 0 && U.chance(0.3)) c.buildDesign = bomberSlot;
        else if (warSlot >= 0) c.buildDesign = warSlot;
      }
      normalizeAlloc(a); // the five bars always total exactly 100% (manual: Planet Production)
      // difficulty production bonus is applied as a hidden multiplier on AI allocations
      c.aiBonus = diff.aiProd;
      c.alloc = a;
    });
  }

  // enforce the MOO invariant: the five spending bars total exactly 100%.
  // Eco keeps its clean minimum; the other bars scale down proportionally,
  // and any leftover percent flows into research.
  function normalizeAlloc(a) {
    var keys = ['ship', 'def', 'ind', 'tech'];
    a.eco = U.clamp(Math.round(a.eco), 0, 100);
    var sum = 0;
    keys.forEach(function (k) { a[k] = Math.max(0, Math.round(a[k])); sum += a[k]; });
    var room = 100 - a.eco;
    if (sum > room) {
      keys.forEach(function (k) { a[k] = sum > 0 ? Math.floor(a[k] * room / sum) : 0; });
      sum = a.ship + a.def + a.ind + a.tech;
    }
    a.tech += room - sum;
  }

  function biggestColony(g, emp) {
    var best = null, bp = -1;
    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      var p = HOO.Colony.rawProduction(emp, e.star);
      if (p > bp) { bp = p; best = e.star.id; }
    });
    return best;
  }

  // ---------- expansion ----------
  function manageExpansion(g, emp) {
    // targets: explored, empty, habitable, in range
    var targets = g.stars.filter(function (s) {
      return s.explored[emp.id] && s.planet && !s.planet.colony &&
        HOO.Ground.canColonize(g, emp, s) &&
        HOO.Fleet.inRange(g, emp, s, null);
    });
    emp.wantColonyShip = targets.length > 0;

    // send colony ships toward best target
    var colSlot = slotOf(emp, function (d) { return d.hasColonyBase; });
    if (colSlot < 0) return;
    if (targets.length) {
      targets.sort(function (a, b) { return score(b) - score(a); });
      g.fleets.forEach(function (f) {
        if (f.empire !== emp.id || f.at === null || f.ships[colSlot] <= 0) return;
        var here = g.stars[f.at];
        if (here.planet && !here.planet.colony && HOO.Ground.canColonize(g, emp, here, f)) {
          if (HOO.Ground.colonize(g, emp.id, here.id, f) && g.empires[0] && !g.empires[0].dead) {
            g.notices.push({ type: 'info', text: 'The ' + HOO.DATA.raceById[emp.raceId].name + ' have founded a colony at ' + here.name + '.', ifExplored: here.id });
          }
          return;
        }
        // steer toward the best target THIS ship's base module can settle;
        // manageDesigns refreshes the shared design when tech outgrows it
        var t = null;
        for (var ti = 0; ti < targets.length; ti++) {
          if (HOO.Ground.canColonize(g, emp, targets[ti], f)) { t = targets[ti]; break; }
        }
        if (t && f.at !== t.id) {
          var counts = [0, 0, 0, 0, 0, 0];
          counts[colSlot] = 1;
          HOO.Fleet.sendFleet(g, emp.id, f.at, t.id, counts);
        }
      });
    }
    function score(s) {
      var p = s.planet;
      var sz = p.size;
      var sp = HOO.CONST.SPECIALS[p.special];
      return sz * (sp.prodMult || 1) + (sp.research ? 40 : 0) + (sp.growth > 1 ? 20 : 0);
    }

    // scouts explore (found by role, never a hard-coded slot; warships stay home)
    var scoutSlot = scoutSlotOf(emp);
    var unexploredAny = g.stars.some(function (s) { return !s.explored[emp.id]; });
    var scoutCount = 0;
    if (scoutSlot >= 0) {
      g.fleets.forEach(function (f) { if (f.empire === emp.id) scoutCount += f.ships[scoutSlot]; });
    }
    emp.wantScouts = scoutSlot >= 0 && unexploredAny && scoutCount < 3;
    if (scoutSlot < 0) return;
    g.fleets.forEach(function (f) {
      if (f.empire !== emp.id || f.at === null || f.ships[scoutSlot] <= 0) return;
      var unexplored = g.stars.filter(function (s) {
        return !s.explored[emp.id] && HOO.Fleet.inRange(g, emp, s, f);
      });
      if (!unexplored.length) return;
      unexplored.sort(function (a, b) {
        return U.dist(f.x, f.y, a.x, a.y) - U.dist(f.x, f.y, b.x, b.y);
      });
      var n = Math.min(f.ships[scoutSlot], 2);
      for (var i = 0; i < n && i < unexplored.length; i++) {
        var counts = [0, 0, 0, 0, 0, 0];
        counts[scoutSlot] = 1;
        HOO.Fleet.sendFleet(g, emp.id, f.at, unexplored[i].id, counts);
      }
    });
  }

  // ---------- planetary reserve ----------
  function manageReserve(g, emp) {
    // pump banked BC into the least developed colony (manual: Planetary Reserve
    // can boost a planet's output; processColony caps the boost at 1 year's raw)
    if (emp.reserve < 30) return;
    var best = null, bestGap = 0;
    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      var c = e.colony;
      if (c.inRebellion || c.quarantine) return;
      if (c.transferFund && c.transferFund > 0) return; // already funded, let it drain
      var mp = HOO.Colony.maxPop(emp, e.star);
      var maxFact = mp * Math.min(emp.derived.controls, c.controls);
      var gap = maxFact - c.factories;
      if (gap > bestGap) { bestGap = gap; best = e; }
    });
    if (!best) return;
    var raw = HOO.Colony.rawProduction(emp, best.star);
    if (raw <= 0) return;
    var grant = Math.min(emp.reserve, Math.max(30, raw));
    emp.reserve -= grant;
    best.colony.transferFund = (best.colony.transferFund || 0) + grant;
  }

  // ---------- transports ----------
  function manageTransports(g, emp) {
    var cols = HOO.Colony.colonies(g, emp.id);

    // put down rebellions first: land loyal troops to restore order
    cols.forEach(function (dst) {
      if (!dst.colony.inRebellion) return;
      var enRoute = g.transports.some(function (t) { return t.empire === emp.id && t.to === dst.star.id; });
      if (enRoute) return;
      var srcs = cols.filter(function (e) {
        return e !== dst && !e.colony.inRebellion && !e.colony.quarantine && e.colony.pop >= 8;
      });
      if (!srcs.length) return;
      srcs.sort(function (a, b) {
        return U.dist(dst.star.x, dst.star.y, a.star.x, a.star.y) - U.dist(dst.star.x, dst.star.y, b.star.x, b.star.y);
      });
      var src = srcs[0];
      var rebels = dst.colony.rebels || Math.ceil(dst.colony.pop * 0.3);
      var n = Math.min(Math.ceil(rebels * 1.5) + 2, Math.floor(src.colony.pop / 2));
      if (n >= 2) HOO.Fleet.sendTransports(g, emp.id, src.star.id, dst.star.id, n);
    });

    var crowded = cols.filter(function (e) { return e.colony.pop > HOO.Colony.maxPop(emp, e.star) * 0.85 && !e.colony.quarantine && !e.colony.inRebellion; });
    var hungry = cols.filter(function (e) { return e.colony.pop < HOO.Colony.maxPop(emp, e.star) * 0.4 && !e.colony.inRebellion; });
    crowded.forEach(function (src) {
      if (!hungry.length) return;
      hungry.sort(function (a, b) {
        return U.dist(src.star.x, src.star.y, a.star.x, a.star.y) - U.dist(src.star.x, src.star.y, b.star.x, b.star.y);
      });
      var dst = hungry[0];
      var n = Math.floor(src.colony.pop * 0.25);
      if (n >= 2) HOO.Fleet.sendTransports(g, emp.id, src.star.id, dst.star.id, n);
    });
  }

  // ---------- war ----------
  function fleetArmed(emp, f) {
    for (var i = 0; i < 6; i++) {
      var d = emp.designs[i];
      if (f.ships[i] > 0 && d && d.weapons.length) return true;
    }
    return false;
  }

  function manageWar(g, emp) {
    var enemies = g.empires.filter(function (o) { return !o.dead && o.id !== emp.id && emp.relations[o.id].war; });
    var myPower = HOO.Turn.powerOf(g, emp);
    var warSlot = slotOf(emp, function (d) { return d.role === 'war'; });
    var bomberSlot = slotOf(emp, function (d) { return d.role === 'bomber'; });

    // defend: recall idle warfleets to threatened colonies
    var threatened = [];
    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      var hostiles = HOO.Fleet.fleetsAt(g, e.star.id).filter(function (f) {
        var o = g.empires[f.empire];
        return o && !o.dead && f.empire !== emp.id && emp.relations[f.empire] && emp.relations[f.empire].war;
      });
      if (hostiles.length) threatened.push(e.star);
    });

    if (!enemies.length) return;

    // orbital bombardment: armed fleets parked over an at-war colony pound it
    // (manual: Bombarding Planets) — unless it is ripe for capture intact
    enemies.forEach(function (en) {
      HOO.Colony.colonies(g, en.id).forEach(function (e) {
        var mine = HOO.Fleet.fleetsAt(g, e.star.id).filter(function (f) {
          return f.empire === emp.id && fleetArmed(emp, f);
        });
        if (!mine.length) return;
        var c = e.colony;
        var pdef = HOO.CONST.PLANET_TYPES[e.star.planet.type];
        var invadable = pdef.hostility <= emp.derived.maxHostility;
        if (invadable && c.bases === 0 && c.pop <= 15) return; // save the factories for invasion
        var rep = HOO.Ground.bombard(g, emp.id, e.star);
        if (!rep) return;
        var txt = 'The ' + HOO.DATA.raceById[emp.raceId].name + ' have bombarded ' + e.star.name + ': ' +
          Math.round(rep.popKilled) + ' million dead, ' + Math.round(rep.factoriesLost) + ' factories destroyed.' +
          (rep.destroyed ? ' The colony has been annihilated.' : '');
        if (en.isPlayer) g.notices.push({ type: 'bad', starId: e.star.id, text: txt });
        else g.notices.push({ type: 'info', text: txt, ifExplored: e.star.id });
      });
    });

    var target = enemies.sort(function (a, b) { return HOO.Turn.powerOf(g, a) - HOO.Turn.powerOf(g, b); })[0];

    // pick enemy colony to strike: weakest defended in range
    var enemyCols = HOO.Colony.colonies(g, target.id).filter(function (e) {
      return HOO.Fleet.inRange(g, emp, e.star, null);
    });
    if (!enemyCols.length) return;
    enemyCols.sort(function (a, b) { return (a.colony.bases * 100 + a.colony.pop) - (b.colony.bases * 100 + b.colony.pop); });
    var strike = enemyCols[0];

    // gather: send warfleets when strong enough
    g.fleets.forEach(function (f) {
      if (f.empire !== emp.id || f.at === null) return;
      var star = g.stars[f.at];
      if (threatened.length && star.id !== threatened[0].id && U.chance(0.5)) {
        // reinforce home defense
        var counts = f.ships.slice();
        counts[1] = 0; // keep colony ships home... slot1 may vary; skip colony designs
        for (var i = 0; i < 6; i++) if (emp.designs[i] && emp.designs[i].hasColonyBase) counts[i] = 0;
        if (counts.some(function (n) { return n > 0; })) HOO.Fleet.sendFleet(g, emp.id, f.at, threatened[0].id, counts);
        return;
      }
      var strength = 0;
      f.ships.forEach(function (n, slot) { if (emp.designs[slot]) strength += n * emp.designs[slot].cost; });
      var defenseGuess = strike.colony.bases * 200 + HOO.Turn.powerOf(g, target) / 8;
      if (strength > defenseGuess * (1.2 - HOO.CONST.DIFFICULTIES[g.difficulty].aiHostility * 0.2)) {
        var counts2 = [0, 0, 0, 0, 0, 0];
        for (var s2 = 0; s2 < 6; s2++) {
          if (emp.designs[s2] && !emp.designs[s2].hasColonyBase) counts2[s2] = f.ships[s2];
        }
        if (counts2.some(function (n) { return n > 0; })) {
          HOO.Fleet.sendFleet(g, emp.id, f.at, strike.star.id, counts2);
        }
      }
    });

    // invade colonies we've beaten down (transports obey fuel range, like the player's)
    HOO.Colony.colonies(g, target.id).forEach(function (e) {
      if (!HOO.Fleet.inRange(g, emp, e.star, null)) return;
      var mine = HOO.Fleet.fleetsAt(g, e.star.id).filter(function (f) { return f.empire === emp.id; });
      if (!mine.length) return;
      if (e.colony.bases > 0) return;
      var def = HOO.CONST.PLANET_TYPES[e.star.planet.type];
      if (def.hostility > emp.derived.maxHostility) return;
      // send troops from nearest big colony
      var src = HOO.Colony.colonies(g, emp.id).sort(function (a, b) {
        return U.dist(a.star.x, a.star.y, e.star.x, e.star.y) - U.dist(b.star.x, b.star.y, e.star.x, e.star.y);
      })[0];
      if (src && src.colony.pop > 20) {
        HOO.Fleet.sendTransports(g, emp.id, src.star.id, e.star.id, Math.floor(src.colony.pop * 0.4));
      }
    });
  }

  // ---------- Orion: assault the Guardian when mighty enough ----------
  function manageGuardian(g, emp) {
    if (!g.guardian.alive) return;
    var orion = null;
    g.stars.forEach(function (s) { if (s.orion) orion = s; });
    if (!orion || !orion.explored[emp.id]) return;
    // stay focused during wars; only occasionally muster the nerve
    var atWar = g.empires.some(function (o) { return !o.dead && o.id !== emp.id && emp.relations[o.id].war; });
    if (atWar || !U.chance(0.04)) return;
    // commit the strongest idle armed fleet, and only when it measures up to the Guardian
    var bestF = null, bestStr = 0;
    g.fleets.forEach(function (f) {
      if (f.empire !== emp.id || f.at === null) return;
      if (!HOO.Fleet.inRange(g, emp, orion, f)) return;
      var str = 0;
      f.ships.forEach(function (n, slot) {
        var d = emp.designs[slot];
        if (d && !d.hasColonyBase && d.weapons.length) str += n * d.cost;
      });
      if (str > bestStr) { bestStr = str; bestF = f; }
    });
    if (!bestF || bestStr < g.guardian.maxHits * 1.5) return;
    var counts = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 6; i++) {
      var d2 = emp.designs[i];
      if (d2 && !d2.hasColonyBase && d2.weapons.length) counts[i] = bestF.ships[i];
    }
    if (counts.some(function (n) { return n > 0; })) {
      HOO.Fleet.sendFleet(g, emp.id, bestF.at, orion.id, counts);
    }
  }

  // ---------- diplomacy ----------
  function manageDiplomacy(g, emp) {
    var pers = HOO.DATA.PERSONALITIES[emp.personality];
    var myPower = HOO.Turn.powerOf(g, emp);
    g.empires.forEach(function (other) {
      if (other.dead || other.id === emp.id) return;
      var rel = emp.relations[other.id];
      if (!rel.contact) return;
      var theirPower = HOO.Turn.powerOf(g, other);

      // war declaration
      if (!rel.war) {
        var threshold = pers.warThreshold * (2 - HOO.CONST.DIFFICULTIES[g.difficulty].aiHostility);
        var wantWar = rel.value < threshold && myPower > theirPower * 1.05;
        if (pers.erratic && U.chance(0.015)) wantWar = true;
        // superiority endgame: strongest empire turns on the weak
        if (myPower > theirPower * 3.5 && U.chance(0.02) && emp.personality !== 'pacifist' && emp.personality !== 'honorable') wantWar = true;
        if (rel.treaty === 'alliance') wantWar = false;
        if (g.council.finalWar) wantWar = false;
        if (wantWar) HOO.Diplomacy.declareWar(g, emp.id, other.id);
      } else {
        // sue for peace?
        var will = pers.peaceWill + rel.warWeary * 0.04 + (theirPower > myPower * 1.6 ? 0.3 : 0);
        if (!g.council.finalWar && U.rand() < will * 0.22) {
          if (other.isPlayer) {
            g.notices.push({
              type: 'diplomacy', kind: 'peaceOffer', empId: emp.id,
              text: 'The ' + HOO.DATA.raceById[emp.raceId].name + ' sue for peace.'
            });
          } else {
            var res = HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'peace');
            if (res.accept) HOO.Diplomacy.makePeace(g, emp.id, other.id);
          }
        }
      }

      // friendly initiatives (neutral parties will talk; evalProposal decides)
      if (!rel.war && rel.value > -5 && !other.isPlayer) {
        if (rel.treaty === 'none' && U.chance(0.06)) {
          var r2 = HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'nonAggression');
          if (r2.accept) { rel.treaty = 'nonAggression'; other.relations[emp.id].treaty = 'nonAggression'; }
        }
        // deepen a long pact into a full alliance
        if (rel.treaty === 'nonAggression' && rel.value > 45 && U.chance(0.04)) {
          var rA = HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'alliance');
          if (rA.accept) { rel.treaty = 'alliance'; other.relations[emp.id].treaty = 'alliance'; }
        }
        if (rel.trade === 0 && U.chance(0.08)) {
          var amt = Math.floor(HOO.Diplomacy.maxTrade(g, emp, other) * 0.6);
          if (amt >= 10) {
            var r3 = HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'trade', { amount: amt });
            if (r3.accept) HOO.Diplomacy.formTrade(g, emp.id, other.id, amt);
          }
        }
        // swap older technologies at a fair level match
        if (U.chance(0.05)) {
          var give = HOO.Diplomacy.tradableTechs(emp, other);
          var want = HOO.Diplomacy.tradableTechs(other, emp);
          if (give.length && want.length) {
            var gv = give[give.length - 1];
            var gt = null;
            want.forEach(function (t) { if (!gt || Math.abs(t.level - gv.level) < Math.abs(gt.level - gv.level)) gt = t; });
            if (gt && Math.abs(gt.level - gv.level) <= 5) HOO.Diplomacy.exchangeTech(g, emp.id, other.id, gv.id, gt.id);
          }
        }
      }
      // realpolitik: tribute to menacing giants, threats to the weak
      if (!rel.war && !other.isPlayer) {
        if (theirPower > myPower * 2 && rel.value < 0 && emp.reserve > 100 && U.chance(0.05)) {
          HOO.Diplomacy.offerTribute(g, emp.id, other.id, Math.min(100, Math.floor(emp.reserve * 0.25)));
        } else if (myPower > theirPower * 2.5 && rel.value < -20 && rel.treaty === 'none' && U.chance(0.04) &&
          emp.personality !== 'pacifist' && emp.personality !== 'honorable') {
          HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'threat');
        }
      }
      // call allies into our wars
      if (!rel.war && rel.treaty === 'alliance' && !other.isPlayer && U.chance(0.06)) {
        var foe = g.empires.filter(function (x) {
          return !x.dead && x.id !== emp.id && x.id !== other.id && emp.relations[x.id].war;
        }).sort(function (x, y) { return HOO.Turn.powerOf(g, x) - HOO.Turn.powerOf(g, y); })[0];
        if (foe) HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'declareWarOn', { target: foe.id });
      }
      // AI proposals to the player arrive as notices the player can act on
      if (!rel.war && other.isPlayer) {
        var raceName = HOO.DATA.raceById[emp.raceId].name;
        if (rel.treaty === 'nonAggression' && rel.value > 50 && U.chance(0.04)) {
          g.notices.push({ type: 'diplomacy', kind: 'allianceOffer', empId: emp.id, text: 'The ' + raceName + ' propose a formal alliance.' });
        } else if (rel.treaty === 'none' && rel.value > 25 && U.chance(0.05)) {
          g.notices.push({ type: 'diplomacy', kind: 'napOffer', empId: emp.id, text: 'The ' + raceName + ' propose a non-aggression pact.' });
        } else if (rel.trade === 0 && rel.value > 10 && U.chance(0.06)) {
          var amt2 = Math.floor(HOO.Diplomacy.maxTrade(g, emp, other) * 0.5);
          if (amt2 >= 10) g.notices.push({ type: 'diplomacy', kind: 'tradeOffer', empId: emp.id, amount: amt2, text: 'The ' + raceName + ' propose a trade agreement of ' + amt2 + ' BC per year.' });
        } else if (myPower > theirPower * 2.5 && rel.value < -20 && U.chance(0.03) &&
          emp.personality !== 'pacifist' && emp.personality !== 'honorable') {
          var demand = Math.max(20, Math.round((emp.economy ? emp.economy.totalRaw : 100) * 0.05));
          g.notices.push({ type: 'diplomacy', kind: 'tributeDemand', empId: emp.id, amount: demand, text: 'The ' + raceName + ' demand a tribute of ' + demand + ' BC, or there will be consequences.' });
        }
      }
    });
  }

  // ---------- spies ----------
  function manageSpies(g, emp) {
    var obj = emp.objective;
    g.empires.forEach(function (other) {
      if (other.dead || other.id === emp.id) return;
      var rel = emp.relations[other.id];
      if (!rel.contact) { return; }
      if (!emp.spies[other.id]) emp.spies[other.id] = { count: 0, mission: 'hide', alloc: 0, fund: 0 };
      var sp = emp.spies[other.id];
      var techGap = 0;
      HOO.CONST.FIELDS.forEach(function (f) {
        techGap += Math.max(0, HOO.State.techLevel(other, f) - HOO.State.techLevel(emp, f));
      });
      if (rel.war) { sp.mission = 'sabotage'; sp.alloc = 4; }
      else if (techGap > 12 && (obj === 'diplomat' || obj === 'technologist' || U.chance(0.3))) { sp.mission = 'espionage'; sp.alloc = 3; }
      else { sp.mission = 'hide'; sp.alloc = sp.count < 1 ? 1 : 0; }
    });
    emp.securityAlloc = U.clamp(Math.round(HOO.Turn.powerRank(g, emp) === 0 ? 6 : 3), 0, 10);
  }

  // ---------- AI empires answer combat prompts (auto) ----------

  HOO.AI = { planTurn: planTurn, slotOf: slotOf };
})();
