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
    manageColonies(g, emp);
    manageExpansion(g, emp);
    manageTransports(g, emp);
    manageWar(g, emp);
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

    // ensure a colony ship design exists (replace with extended-environment versions)
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
    }

    // main warship: refresh when tech has moved on
    var age = emp.designAge || 0;
    var warSlot = slotOf(emp, function (d) { return d.role === 'war'; });
    var wantNew = warSlot < 0;
    if (!wantNew && warSlot >= 0) {
      var cur = emp.designs[warSlot];
      var curBest = cur.weapons.length ? HOO.DATA.techById[cur.weapons[0].id].level : 0;
      if (bestBeam && bestBeam.level > curBest + 6) wantNew = true;
      if (bestMissile && bestMissile.level > curBest + 8) wantNew = true;
    }
    if (wantNew && (bestBeam || bestMissile)) {
      var fs2 = freeSlot(emp);
      if (fs2 < 0) { scrapWorst(g, emp); fs2 = freeSlot(emp); }
      if (fs2 >= 0) {
        var hullId = HOO.State.techLevel(emp, 'construction') > 14 ? 'large' : 'medium';
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
          // scale up counts to fill space
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
    // scrap the oldest non-colony design with fewest ships
    var worst = -1, worstScore = Infinity;
    for (var i = 0; i < 6; i++) {
      var d = emp.designs[i];
      if (!d || d.hasColonyBase) continue;
      var count = 0;
      g.fleets.forEach(function (f) { if (f.empire === emp.id) count += f.ships[i]; });
      var score = count * d.cost;
      if (score < worstScore) { worstScore = score; worst = i; }
    }
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

      // ecology need: keep clean
      var working = Math.min(c.factories, c.pop * Math.min(d.controls, c.controls));
      var raw = Math.max(1, HOO.Colony.rawProduction(emp, e.star));
      var wasteCost = (star.planet.waste + working * d.wastePct) / d.wastePerBC;
      a.eco = U.clamp(Math.ceil(wasteCost / raw * 100) + 4, 6, 45);
      if (HOO.DATA.raceById[emp.raceId].wasteImmune) a.eco = 5;

      if (c.factories < maxFact * 0.9) {
        a.ind = 100 - a.eco - 10;
        a.tech = 10;
      } else {
        // developed: research + defense + ships
        var shipShare = atWar ? 45 : (obj.fleetHunger ? 25 : 12);
        var defShare = atWar ? 15 : 8;
        if (c.bases >= 6 + (atWar ? 6 : 0)) defShare = 0;
        var indShare = c.factories < maxFact ? 10 : 0;
        a.ship = shipShare; a.def = defShare; a.ind = indShare;
        a.tech = Math.max(0, 100 - a.eco - a.ship - a.def - a.ind);
      }

      // building choice: colony ships from the biggest colony
      if (wantColonyShip && star.id === biggestColony(g, emp)) {
        var colSlot = slotOf(emp, function (dd) { return dd.hasColonyBase; });
        if (colSlot >= 0) { c.buildDesign = colSlot; a.ship = Math.max(a.ship, 40); a.tech = Math.max(0, 100 - a.eco - a.ship - a.def - a.ind); }
      } else {
        var warSlot = slotOf(emp, function (dd) { return dd.role === 'war'; });
        var bomberSlot = slotOf(emp, function (dd) { return dd.role === 'bomber'; });
        if (atWar && bomberSlot >= 0 && U.chance(0.3)) c.buildDesign = bomberSlot;
        else if (warSlot >= 0) c.buildDesign = warSlot;
      }
      // difficulty production bonus is applied as a hidden multiplier on AI allocations
      c.aiBonus = diff.aiProd;
      c.alloc = a;
    });
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
        if (here.planet && !here.planet.colony && HOO.Ground.canColonize(g, emp, here)) {
          HOO.Ground.colonize(g, emp.id, here.id, f);
          if (g.empires[0] && !g.empires[0].dead) {
            g.notices.push({ type: 'info', text: 'The ' + HOO.DATA.raceById[emp.raceId].name + ' have founded a colony at ' + here.name + '.', ifExplored: here.id });
          }
          return;
        }
        var t = targets[0];
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

    // scouts explore
    var scoutSlot = 0;
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

  // ---------- transports ----------
  function manageTransports(g, emp) {
    var cols = HOO.Colony.colonies(g, emp.id);
    var crowded = cols.filter(function (e) { return e.colony.pop > HOO.Colony.maxPop(emp, e.star) * 0.85 && !e.colony.quarantine; });
    var hungry = cols.filter(function (e) { return e.colony.pop < HOO.Colony.maxPop(emp, e.star) * 0.4; });
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

    // invade colonies we've beaten down
    HOO.Colony.colonies(g, target.id).forEach(function (e) {
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

      // friendly initiatives
      if (!rel.war && rel.value > 10 && !other.isPlayer) {
        if (rel.treaty === 'none' && U.chance(0.06)) {
          var r2 = HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'nonAggression');
          if (r2.accept) { rel.treaty = 'nonAggression'; other.relations[emp.id].treaty = 'nonAggression'; }
        }
        if (rel.trade === 0 && U.chance(0.08)) {
          var amt = Math.floor(HOO.Diplomacy.maxTrade(g, emp, other) * 0.6);
          if (amt >= 10) {
            var r3 = HOO.Diplomacy.evalProposal(g, other.id, emp.id, 'trade', { amount: amt });
            if (r3.accept) HOO.Diplomacy.formTrade(g, emp.id, other.id, amt);
          }
        }
      }
      // AI proposals to the player arrive as notices the player can act on
      if (!rel.war && other.isPlayer) {
        if (rel.treaty === 'none' && rel.value > 25 && U.chance(0.05)) {
          g.notices.push({ type: 'diplomacy', kind: 'napOffer', empId: emp.id, text: 'The ' + HOO.DATA.raceById[emp.raceId].name + ' propose a non-aggression pact.' });
        } else if (rel.trade === 0 && rel.value > 10 && U.chance(0.06)) {
          var amt2 = Math.floor(HOO.Diplomacy.maxTrade(g, emp, other) * 0.5);
          if (amt2 >= 10) g.notices.push({ type: 'diplomacy', kind: 'tradeOffer', empId: emp.id, amount: amt2, text: 'The ' + HOO.DATA.raceById[emp.raceId].name + ' propose a trade agreement of ' + amt2 + ' BC per year.' });
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
