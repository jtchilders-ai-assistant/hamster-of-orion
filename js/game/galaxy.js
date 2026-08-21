/* Hamster of Orion — galaxy generation */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  var PARSEC = 30; // pixels per parsec in galaxy coordinates

  var STAR_COLORS = [
    { id: 'yellow', c: '#FFD97A', w: 30 },
    { id: 'red', c: '#FF8A6B', w: 25 },
    { id: 'green', c: '#9BE8A0', w: 15 },
    { id: 'blue', c: '#8FBFFF', w: 12 },
    { id: 'white', c: '#F2F4FF', w: 12 },
    { id: 'purple', c: '#C99BFF', w: 6 }
  ];

  // planet chance & type table by star color
  function rollPlanet(colorId, inNebula) {
    var r = U.rand();
    var none = { yellow: 0.05, red: 0.20, green: 0.15, blue: 0.25, white: 0.30, purple: 0.45 }[colorId];
    if (r < none) return null;

    var types = Object.keys(HOO.CONST.PLANET_TYPES);
    var t;
    var q = U.rand();
    if (colorId === 'yellow') {
      t = q < 0.45 ? U.pick(['terran', 'jungle', 'ocean']) :
          q < 0.8 ? U.pick(['arid', 'steppe', 'desert', 'minimal']) :
          U.pick(types);
    } else if (colorId === 'red') {
      t = q < 0.2 ? U.pick(['terran', 'jungle', 'ocean']) :
          q < 0.6 ? U.pick(['arid', 'steppe', 'desert', 'minimal']) :
          U.pick(['barren', 'tundra', 'dead', 'desert', 'minimal']);
    } else if (colorId === 'green') {
      t = q < 0.3 ? U.pick(['terran', 'jungle', 'ocean']) :
          q < 0.65 ? U.pick(['arid', 'steppe', 'desert', 'minimal']) : U.pick(types);
    } else if (colorId === 'purple') {
      t = U.pick(['radiated', 'toxic', 'inferno', 'dead', 'barren', 'minimal']);
    } else {
      // blue/white — risk/reward frontier: mostly hostile rock, garden worlds
      // rare, compensated by the mineral-rich bonus in richChance below
      t = q < 0.08 ? U.pick(['terran', 'jungle', 'ocean']) :
          q < 0.25 ? U.pick(['arid', 'steppe', 'desert', 'minimal']) :
          U.pick(['barren', 'tundra', 'dead', 'inferno', 'toxic', 'radiated']);
    }

    var def = HOO.CONST.PLANET_TYPES[t];
    var size = U.rint(def.size[0], def.size[1]);
    size = Math.round(size / 5) * 5;

    // specials — mineral/artifact rolls only; Fertile and Gaia worlds never spawn
    // naturally, they arise solely from Soil Enrichment terraforming (see colony.js)
    var special = 'none';
    var hostile = def.hostility > 0;
    var richChance = (hostile ? 0.25 : 0.05) + (inNebula ? 0.15 : 0) +
      (colorId === 'purple' ? 0.2 : 0) +
      (colorId === 'blue' || colorId === 'white' ? 0.15 : 0);
    var s = U.rand();
    if (s < richChance * 0.35) special = 'ultrarich';
    else if (s < richChance) special = 'rich';
    else if (s < richChance + 0.06 && !hostile) special = 'artifact';
    else if (s < richChance + 0.10) special = 'poor';
    else if (s < richChance + 0.12) special = 'ultrapoor';

    return { type: t, size: size, baseSize: size, special: special, colony: null, waste: 0, terraformed: 0, envConverted: false };
  }

  function generate(g, opts) {
    var conf = HOO.CONST.GALAXY_SIZES[opts.size];
    g.w = conf.w; g.h = conf.h;
    var pad = 40;

    // nebulas
    g.nebulas = [];
    var nNeb = U.rint(1, opts.size === 'small' ? 1 : (opts.size === 'huge' ? 4 : 2));
    for (var n = 0; n < nNeb; n++) {
      g.nebulas.push({
        x: U.rint(pad * 2, conf.w - pad * 2), y: U.rint(pad * 2, conf.h - pad * 2),
        rx: U.rint(70, 150), ry: U.rint(50, 110), rot: U.rand() * Math.PI
      });
    }

    function inNebula(x, y) {
      for (var i = 0; i < g.nebulas.length; i++) {
        var nb = g.nebulas[i];
        var dx = (x - nb.x), dy = (y - nb.y);
        var ca = Math.cos(-nb.rot), sa = Math.sin(-nb.rot);
        var lx = dx * ca - dy * sa, ly = dx * sa + dy * ca;
        if ((lx * lx) / (nb.rx * nb.rx) + (ly * ly) / (nb.ry * nb.ry) <= 1) return true;
      }
      return false;
    }

    // place stars with minimum separation
    var names = U.shuffle(HOO.DATA.STAR_NAMES);
    var minDist = PARSEC * 1.8;
    var stars = [];

    // Orion in the general vicinity of the middle — never the exact centre,
    // and kept out of nebulas so nebula rules stay consistent for the system
    var ox, oy, oTry = 0;
    do {
      var oAng = U.rand() * Math.PI * 2;
      var oRad = (0.06 + U.rand() * 0.14) * Math.min(conf.w, conf.h);
      ox = U.clamp(conf.w / 2 + Math.cos(oAng) * oRad, pad, conf.w - pad);
      oy = U.clamp(conf.h / 2 + Math.sin(oAng) * oRad, pad, conf.h - pad);
      oTry++;
    } while (inNebula(ox, oy) && oTry < 40);
    stars.push({ x: ox, y: oy, orion: true });

    var attempts = 0;
    while (stars.length < conf.stars && attempts < 8000) {
      attempts++;
      var x = U.rint(pad, conf.w - pad), y = U.rint(pad, conf.h - pad);
      var ok = true;
      for (var i = 0; i < stars.length; i++) {
        if (U.dist(x, y, stars[i].x, stars[i].y) < minDist) { ok = false; break; }
      }
      if (ok) stars.push({ x: x, y: y });
    }

    g.stars = stars.map(function (s, idx) {
      var star;
      if (s.orion) {
        star = {
          id: idx, name: 'Orion', x: s.x, y: s.y,
          color: 'white', colorHex: '#F2F4FF', orion: true, inNebula: inNebula(s.x, s.y),
          planet: { type: 'terran', size: 120, baseSize: 120, special: 'orion', colony: null, waste: 0, terraformed: 0, envConverted: false },
          explored: {}
        };
        g.orionStarId = idx;
      } else {
        var cw = STAR_COLORS.reduce(function (a, c) { return a + c.w; }, 0);
        var r = U.rand() * cw, col = STAR_COLORS[0];
        for (var ci = 0; ci < STAR_COLORS.length; ci++) { r -= STAR_COLORS[ci].w; if (r <= 0) { col = STAR_COLORS[ci]; break; } }
        var neb = inNebula(s.x, s.y);
        star = {
          id: idx, name: names[idx % names.length], x: s.x, y: s.y,
          color: col.id, colorHex: col.c, orion: false, inNebula: neb,
          planet: rollPlanet(col.id, neb),
          explored: {}
        };
      }
      return star;
    });

    // homeworld selection: maximize spread; skip Orion, and skip nebula-bound stars
    // so nebula rules (warp 1, no shields) never apply to a starting system
    var orionStar = g.stars[g.orionStarId];
    var nEmp = g.empires.length;
    var candidates = g.stars.filter(function (s) { return !s.orion && !s.inNebula; });
    if (candidates.length < nEmp) candidates = g.stars.filter(function (s) { return !s.orion; });
    var homes = [];
    // greedy farthest-point selection; the first pick gets the same Orion
    // clearance the rest of the loop enforces (no one starts next to the Guardian)
    var firstPool = candidates.filter(function (s) {
      return U.dist(s.x, s.y, orionStar.x, orionStar.y) >= 6 * PARSEC;
    });
    homes.push(U.pick(firstPool.length ? firstPool : candidates));
    while (homes.length < nEmp) {
      var best = null, bestScore = -1;
      candidates.forEach(function (s) {
        if (homes.indexOf(s) >= 0) return;
        var dmin = Infinity;
        homes.forEach(function (h) { dmin = Math.min(dmin, U.dist(s.x, s.y, h.x, h.y)); });
        // stay away from Orion too
        dmin = Math.min(dmin, U.dist(s.x, s.y, orionStar.x, orionStar.y) * 1.2);
        if (dmin > bestScore) { bestScore = dmin; best = s; }
      });
      homes.push(best);
    }

    // relocate a spare star (not Orion, not a home, not another home's neighbour)
    // to a random clear spot within [rMin, rMax] parsecs of `home`; rerolls its planet
    function pullStarNear(home, rMin, rMax) {
      var spare = null, sd = Infinity;
      g.stars.forEach(function (s) {
        if (s.orion || homes.indexOf(s) >= 0) return;
        for (var h = 0; h < homes.length; h++) {
          if (U.dist(s.x, s.y, homes[h].x, homes[h].y) <= 5 * PARSEC) return;
        }
        var d = U.dist(s.x, s.y, home.x, home.y);
        if (d < sd) { sd = d; spare = s; }
      });
      if (!spare) {
        // crowded small maps: every star neighbours some home — steal from the
        // home with the most surplus planet-neighbours so its guarantee survives
        var bestSc = -Infinity;
        g.stars.forEach(function (s) {
          if (s.orion || homes.indexOf(s) >= 0) return;
          if (U.dist(s.x, s.y, home.x, home.y) <= rMax * PARSEC) return;
          var nd = Infinity, owner = null;
          homes.forEach(function (h) {
            if (h === home) return;
            var d = U.dist(s.x, s.y, h.x, h.y);
            if (d < nd) { nd = d; owner = h; }
          });
          var surplus = 0;
          if (owner) {
            g.stars.forEach(function (o) {
              if (o === s || o.orion || homes.indexOf(o) >= 0 || !o.planet) return;
              if (U.dist(o.x, o.y, owner.x, owner.y) <= 5 * PARSEC) surplus++;
            });
          }
          var sc = surplus * 1000 + nd;
          if (sc > bestSc) { bestSc = sc; spare = s; }
        });
      }
      if (!spare) return null;
      for (var t = 0; t < 200; t++) {
        var ang = U.rand() * Math.PI * 2;
        var rad = (rMin + U.rand() * (rMax - rMin)) * PARSEC;
        var nx = home.x + Math.cos(ang) * rad, ny = home.y + Math.sin(ang) * rad;
        if (nx < pad || nx > conf.w - pad || ny < pad || ny > conf.h - pad) continue;
        var clear = true;
        for (var i = 0; i < g.stars.length; i++) {
          var o = g.stars[i];
          if (o !== spare && U.dist(nx, ny, o.x, o.y) < minDist) { clear = false; break; }
        }
        if (!clear) continue;
        spare.x = nx; spare.y = ny;
        spare.inNebula = inNebula(nx, ny);
        spare.planet = rollPlanet(spare.color, spare.inNebula);
        return spare;
      }
      return null;
    }

    g.empires.forEach(function (emp, i) {
      var hs = homes[i];
      hs.color = 'yellow'; hs.colorHex = '#FFD97A';
      hs.inNebula = inNebula(hs.x, hs.y); // consistent with the geometric test fleets use
      hs.name = HOO.DATA.HOMEWORLDS[emp.raceId] || hs.name;
      hs.planet = { type: 'terran', size: 100, baseSize: 100, special: 'none', colony: null, waste: 0, terraformed: 0, envConverted: false };
      emp.homeStarId = hs.id;

      // playable-start guarantee: at least one habitable planet within the starting
      // fuel range of 3 parsecs (colony ships carry no reserve tanks), and at least
      // two planets of any quality within 5 — pulling spare stars in if the roll is dry
      function within(r) {
        return g.stars.filter(function (s) {
          return s !== hs && !s.orion && homes.indexOf(s) < 0 &&
            U.dist(s.x, s.y, hs.x, hs.y) <= r * PARSEC;
        });
      }
      var near3 = within(3);
      if (!near3.length) {
        var pulled = pullStarNear(hs, 1.9, 3);
        if (pulled) near3 = [pulled];
      }
      var habitable = near3.filter(function (s) { return s.planet && HOO.CONST.PLANET_TYPES[s.planet.type].hostility === 0; });
      if (habitable.length < 1 && near3.length) {
        var fix = U.pick(near3);
        fix.planet = rollPlanet('yellow', false) || { type: 'arid', size: 50, baseSize: 50, special: 'none', colony: null, waste: 0, terraformed: 0, envConverted: false };
        if (HOO.CONST.PLANET_TYPES[fix.planet.type].hostility > 0) {
          fix.planet.type = 'arid'; fix.planet.size = Math.max(40, fix.planet.size);
          fix.planet.baseSize = fix.planet.size;
        }
      }
      var guard = 0;
      while (within(5).filter(function (s) { return s.planet; }).length < 2 && guard++ < 6) {
        var extra = pullStarNear(hs, 1.9, 5);
        if (!extra) break;
        if (!extra.planet) {
          extra.planet = { type: 'minimal', size: 30, baseSize: 30, special: 'none', colony: null, waste: 0, terraformed: 0, envConverted: false };
        }
      }
    });
  }

  function starDist(a, b) { return U.dist(a.x, a.y, b.x, b.y) / PARSEC; }

  HOO.Galaxy = { generate: generate, PARSEC: PARSEC, starDist: starDist, STAR_COLORS: STAR_COLORS };
})();
