/* Hamster of Orion — crises & disasters runtime */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  function fill(tmpl, ctx) {
    return tmpl.split('{colony}').join(ctx.colony || '')
      .split('{race}').join(ctx.race || '')
      .split('{star}').join(ctx.star || '');
  }

  function randomColonyOf(g, emp) {
    var cols = HOO.Colony.colonies(g, emp.id);
    return cols.length ? U.pick(cols) : null;
  }

  // manual p.50: each random event strikes at most once per game
  function firedSet(g) {
    g.firedEvents = g.firedEvents || {};
    return g.firedEvents;
  }

  // can this event meaningfully fire against this target right now?
  // (keeps an active comet/pirates/monster from being silently overwritten,
  // and keeps no-op picks from wasting the event slot)
  function eligible(g, ev, emp, star, alive) {
    var p = star.planet, c = p.colony;
    switch (ev.id) {
      case 'comet': return !g.comet;
      case 'piracy': return !g.pirates;
      case 'amoeba':
      case 'crystal': return !g.monster;
      case 'blunder': return alive.some(function (o) { return o.id !== emp.id && emp.relations[o.id].contact; });
      case 'mineral_rich': return p.special === 'none' || p.special === 'poor';
      case 'mineral_poor': return p.special === 'none' || p.special === 'rich';
      case 'rebellion': return star.id !== emp.homeStarId;
      case 'plague': return !c.plague;
      case 'supernova': return !c.novaThreat;
    }
    return true;
  }

  // called once per year; may fire one event
  function maybeFire(g) {
    var notices = [];
    if (g.turn < 30) return notices; // grace period
    g.eventCooldown--;
    var chance = Math.max(0.02, (0 - g.eventCooldown) * 0.015 + 0.03);
    if (g.eventCooldown > 0 || !U.chance(chance)) return notices;
    g.eventCooldown = U.rint(6, 14);

    var alive = g.empires.filter(function (e) { return !e.dead; });
    var emp = U.pick(alive);
    var target = randomColonyOf(g, emp);
    if (!target) return notices;
    var c = target.colony, star = target.star, p = star.planet;
    var fired = firedSet(g);
    var pool = HOO.DATA.EVENTS.filter(function (e2) {
      return !fired[e2.id] && eligible(g, e2, emp, star, alive);
    });
    if (!pool.length) return notices; // every event has already run its course
    var ev = weightedPick(pool);
    fired[ev.id] = true;
    var raceName = HOO.DATA.raceById[emp.raceId].name;
    var ctx = { colony: star.name, race: raceName, star: star.name };

    switch (ev.id) {
      case 'derelict': {
        var fields = ['forceFields', 'weapons'];
        fields.forEach(function (f) {
          var ch = HOO.Research.choices(emp, f);
          if (ch.length) HOO.State.grantTech(emp, ch[0].id);
        });
        break;
      }
      case 'climate': p.climateShift = true; break;
      case 'comet': {
        g.comet = { starId: star.id, empId: emp.id, strength: U.rint(20, 60), eta: U.rint(4, 8) };
        break;
      }
      case 'virus': {
        // manual p.50: every point accumulated in the field is destroyed
        var f2 = U.pick(HOO.CONST.FIELDS);
        var pr = emp.research.projects[f2];
        if (pr) pr.invested = 0;
        break;
      }
      case 'blunder': {
        // {race} stays the blundering empire; only the penalty involves the
        // offended court (o2's opinion OF emp drops)
        var others = alive.filter(function (o) { return o.id !== emp.id && emp.relations[o.id].contact; });
        if (others.length) {
          var o2 = U.pick(others);
          HOO.Diplomacy.adjust(g, o2.id, emp.id, -30, true);
        }
        break;
      }
      case 'donation': emp.reserve += Math.round((emp.economy ? emp.economy.totalRaw : 100) * U.rint(4, 8) / 10); break;
      case 'earthquake': {
        c.pop = Math.max(1, c.pop * (1 - U.rint(10, 30) / 100));
        c.factories = Math.max(0, c.factories * (1 - U.rint(20, 40) / 100));
        break;
      }
      // manual p.50: the accident floods the planet with waste — it never
      // cleans it. 0.75 * size is the engine's waste cap (colony.js).
      case 'accident': p.waste = Math.max(p.waste, p.size * 0.75); break;
      case 'mineral_rich': p.special = 'rich'; break;
      case 'mineral_poor': p.special = p.special === 'rich' ? 'none' : 'poor'; break;
      case 'piracy': g.pirates = { starId: star.id, victim: emp.id, strength: U.rint(10, 30) }; break;
      case 'plague': c.plague = true; c.quarantine = true; c.plagueNeed = U.rint(200, 600); c.plagueProgress = 0; break;
      case 'rebellion': {
        c.inRebellion = true; c.rebels = Math.ceil(c.pop * 0.5);
        break;
      }
      case 'amoeba':
      case 'crystal': spawnMonster(g, star, ev.id); break;
      case 'supernova': c.novaThreat = true; c.novaNeed = U.rint(300, 800); c.novaProgress = 0; c.novaYears = U.rint(6, 10); break;
    }

    var text = fill(ev.text, ctx);
    notices.push({ type: 'event', good: ev.good, name: ev.name, text: text, empId: emp.id });
    return notices;
  }

  function weightedPick(list) {
    var tw = list.reduce(function (a, e) { return a + e.weight; }, 0);
    var r = U.rand() * tw;
    for (var i = 0; i < list.length; i++) { r -= list[i].weight; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }

  // ---------- space monsters (manual p.50: Space Amoeba / Space Crystal) ----------

  // the monster appears several parsecs out, so GNN's warning names the
  // threatened system while there is still time to defend or evacuate
  function spawnMonster(g, star, type) {
    var stats = type === 'amoeba' ?
      // no weaponIds: falls back to the close-range monster maw in combat.js
      { name: 'Space Amoeba', maxHits: 3500, attack: 9, defense: 4, shield: 4, ecm: 4, speed: 1, initiative: 12, weaponIds: [], weaponCount: 4 } :
      // the crystal ray strikes every facing — the enveloping heavy fits
      { name: 'Space Crystal', maxHits: 3000, attack: 8, defense: 7, shield: 8, ecm: 7, speed: 2, initiative: 18, weaponIds: ['stellar_converter'], weaponCount: 3 };
    // drift in from deep space, biased toward the galactic interior so the
    // spawn point stays on the map
    var ang = Math.atan2(g.h / 2 - star.y, g.w / 2 - star.x) + (U.rand() - 0.5) * Math.PI;
    var rad = U.rint(5, 8) * HOO.Galaxy.PARSEC;
    g.monster = {
      type: type, name: stats.name,
      x: U.clamp(star.x + Math.cos(ang) * rad, 0, g.w),
      y: U.clamp(star.y + Math.sin(ang) * rad, 0, g.h),
      targetStarId: star.id,
      maxHits: stats.maxHits, hits: stats.maxHits,
      attack: stats.attack, defense: stats.defense, shield: stats.shield, ecm: stats.ecm,
      speed: stats.speed, initiative: stats.initiative,
      weaponIds: stats.weaponIds, weaponCount: stats.weaponCount, specials: {}
    };
  }

  // remove a colony and, as with invasion (ground.js), settle empire
  // elimination immediately rather than a full turn later
  function destroyColony(g, star) {
    var c = star.planet.colony;
    if (!c) return;
    var emp = g.empires[c.empire];
    star.planet.colony = null;
    if (emp && !HOO.Colony.colonies(g, emp.id).length) HOO.Turn.eliminateEmpire(g, emp);
  }

  // each monster's signature aftermath: the Amoeba consumes the biosphere and
  // leaves a small radiated husk; the Crystal strips all life and buries the
  // surface in waste but leaves the world itself recolonizable
  function ravagePlanet(m, star) {
    var p = star.planet;
    if (m.type === 'amoeba') {
      p.type = 'radiated';
      p.baseSize = Math.min(p.baseSize, U.rint(10, 20));
      p.terraformed = 0;
      p.soilBonus = 1;
      p.envConverted = false;
      p.climateShift = false;
      if (p.special === 'fertile' || p.special === 'gaia') p.special = 'none';
      p.waste = 0;
      p.size = p.baseSize;
    } else {
      p.waste = p.size * 0.75; // the engine's waste cap (colony.js)
    }
  }

  // build the tactical battle for a monster arrival (the monster attacks;
  // the defender fights with fleets and, if it owns the colony, its bases)
  function buildMonsterBattle(g, desc) {
    var m = g.monster;
    if (!m) return null;
    var star = g.stars[desc.starId];
    var fleets = HOO.Fleet.fleetsAt(g, star.id).filter(function (f) { return f.empire === desc.defEmpId; });
    var col = star.planet ? star.planet.colony : null;
    var withBases = !!(col && col.empire === desc.defEmpId && col.bases > 0);
    if (!fleets.length && !withBases) return null;
    return HOO.Combat.createBattle(g, {
      star: star,
      attacker: { monster: m },
      defender: { empId: desc.defEmpId, fleets: fleets, withBases: withBases }
    });
  }

  // call after Combat.applyResults on a monster battle: settles slaying,
  // continued siege, or the devouring of the colony. Returns notices for the
  // caller to surface.
  function monsterBattleResolved(g, battle) {
    var notices = [];
    var m = g.monster;
    if (!m) return notices;
    var tstar = g.stars[m.targetStarId];
    if (m.hits <= 0) {
      var defEmp = battle && battle.sides[1] && battle.sides[1].empId !== undefined && battle.sides[1].empId !== null ?
        g.empires[battle.sides[1].empId] : null;
      var who = defEmp ? 'The fleet of the ' + HOO.DATA.raceById[defEmp.raceId].name + ' has' : 'The defenders have';
      notices.push({
        type: 'event', good: true, name: 'The Monster Falls',
        text: who + ' slain the ' + m.name + ' at ' + tstar.name + '.'
      });
      g.monster = null;
      return notices;
    }
    // defenders still stand — another empire's fleets, or surviving bases:
    // the monster besieges the system and fights again next year
    var col = tstar.planet ? tstar.planet.colony : null;
    if (HOO.Fleet.fleetsAt(g, tstar.id).length || (col && col.bases > 0)) {
      // repelled outright: a bloodied monster may abandon the hunt
      if (battle && battle.winner === 1 && U.chance(0.3)) {
        notices.push({
          type: 'event', good: true, name: 'Monster Repelled',
          text: 'The ' + m.name + ' recoils from the defense of ' + tstar.name + ' and retreats into deep space.'
        });
        g.monster = null;
      }
      return notices;
    }
    return notices.concat(monsterDevours(g));
  }

  // the monster has broken through: consume the colony, ruin the planet,
  // then drift toward its next victim
  function monsterDevours(g) {
    var notices = [];
    var m = g.monster;
    var tstar = g.stars[m.targetStarId];
    if (tstar.planet && tstar.planet.colony) {
      destroyColony(g, tstar);
      ravagePlanet(m, tstar);
      notices.push({
        type: 'event', good: false, name: 'Colony Devoured',
        text: m.type === 'amoeba' ?
          'The Space Amoeba has consumed all life at ' + tstar.name + '. Only a radiated husk remains.' :
          'The Space Crystal has stripped ' + tstar.name + ' bare. The surface lies buried in crystalline waste.'
      });
    }
    // pick the next inhabited target — or drift away
    var targets = g.stars.filter(function (s) { return s.planet && s.planet.colony; });
    if (targets.length && U.chance(0.8)) {
      var nt = targets.sort(function (a, b) {
        return U.dist(m.x, m.y, a.x, a.y) - U.dist(m.x, m.y, b.x, b.y);
      })[0];
      m.targetStarId = nt.id;
      notices.push({
        type: 'event', good: false, name: 'Monster Underway',
        text: 'The ' + m.name + ' is moving again. Astrogators project its course: ' + nt.name + '.'
      });
    } else {
      notices.push({
        type: 'event', good: true, name: 'Monster Departs',
        text: 'The ' + m.name + ' has drifted beyond the rim of known space.'
      });
      g.monster = null;
    }
    return notices;
  }

  // ongoing event progression each year
  function progress(g) {
    var notices = [];

    // comet
    if (g.comet) {
      var star = g.stars[g.comet.starId];
      var fleets = HOO.Fleet.fleetsAt(g, star.id).filter(function (f) { return f.empire === g.comet.empId; });
      var guns = 0;
      fleets.forEach(function (f) {
        var emp = g.empires[f.empire];
        f.ships.forEach(function (n, slot) {
          if (emp.designs[slot]) guns += n * (emp.designs[slot].cost / 20);
        });
      });
      g.comet.strength -= guns;
      g.comet.eta--;
      if (g.comet.strength <= 0) {
        notices.push({ type: 'event', good: true, name: 'Comet Destroyed', text: 'The fleet at ' + star.name + ' has shattered the comet. The colony is saved.' });
        g.comet = null;
      } else if (g.comet.eta <= 0) {
        if (star.planet.colony) {
          destroyColony(g, star);
          notices.push({ type: 'event', good: false, name: 'Impact', text: 'The comet has struck ' + star.name + '. The colony has been obliterated.' });
        }
        g.comet = null;
      }
    }

    // pirates: cleared by ships present
    if (g.pirates) {
      var pstar = g.stars[g.pirates.starId];
      var pf = HOO.Fleet.fleetsAt(g, pstar.id).filter(function (f) { return f.empire === g.pirates.victim; });
      var power = 0;
      pf.forEach(function (f) {
        var emp = g.empires[f.empire];
        f.ships.forEach(function (n, slot) { if (emp.designs[slot]) power += n * emp.designs[slot].cost / 30; });
      });
      g.pirates.strength -= power;
      if (g.pirates.strength <= 0) {
        notices.push({ type: 'event', good: true, name: 'Pirates Crushed', text: 'Patrols at ' + pstar.name + ' have burned out the pirate holdouts. Trade resumes.' });
        g.pirates = null;
      }
    }

    // legacy saves: a pre-rework monster becomes a crystal
    if (g.monster && !g.monster.type) { g.monster.type = 'crystal'; g.monster.name = 'Space Crystal'; }

    // defensive net only: turn.js consumes and clears g.monsterCombats in the
    // same nextTurn() call, so this cannot fire in normal play — it exists to
    // keep hand-edited or future-refactored saves from wedging a battle forever
    if (g.monster && g.monsterCombats && g.monsterCombats.length) {
      g.monsterCombats.forEach(function (desc) {
        if (!g.monster) return;
        var fb = buildMonsterBattle(g, desc);
        if (!fb) return;
        HOO.Combat.autoResolve(fb);
        HOO.Combat.applyResults(g, fb);
        notices = notices.concat(monsterBattleResolved(g, fb));
      });
    }
    g.monsterCombats = [];

    // space monster approaches, besieges, and eats colonies
    if (g.monster) {
      var m = g.monster;
      var tstar = g.stars[m.targetStarId];
      var d = U.dist(m.x, m.y, tstar.x, tstar.y);
      var step = m.speed * HOO.Galaxy.PARSEC;
      if (d <= step) {
        m.x = tstar.x; m.y = tstar.y;
        var mfleets = HOO.Fleet.fleetsAt(g, tstar.id);
        var mcol = tstar.planet ? tstar.planet.colony : null;
        // the colony's owner leads the defense; otherwise whoever holds
        // orbit. Other empires present fight in later years — the monster
        // stays until every defender is beaten.
        var defEmpId = null;
        if (mcol && (mcol.bases > 0 || mfleets.some(function (f) { return f.empire === mcol.empire; }))) defEmpId = mcol.empire;
        else if (mfleets.length) defEmpId = mfleets[0].empire;

        if (defEmpId === 0 && !g.empires[0].dead) {
          // the player commands the defense: queue for turn.js to route
          // through the normal pending-battle flow
          g.monsterCombats.push({ starId: tstar.id, defEmpId: 0 });
        } else if (defEmpId !== null) {
          var mb = buildMonsterBattle(g, { starId: tstar.id, defEmpId: defEmpId });
          if (mb) {
            HOO.Combat.autoResolve(mb);
            HOO.Combat.applyResults(g, mb);
            notices = notices.concat(monsterBattleResolved(g, mb));
          } else {
            notices = notices.concat(monsterDevours(g));
          }
        } else {
          notices = notices.concat(monsterDevours(g));
        }
      } else {
        m.x += (tstar.x - m.x) / d * step;
        m.y += (tstar.y - m.y) / d * step;
      }
    }

    // plagues & novas absorb colony research
    g.stars.forEach(function (s) {
      if (!s.planet || !s.planet.colony) return;
      var c = s.planet.colony;
      var emp = g.empires[c.empire];
      if (c.plague) {
        var rp = HOO.Colony.rawProduction(emp, s) * (c.alloc.tech / 100 + 0.3);
        c.plagueProgress += rp;
        // attrition itself is applied once, in growPopulation (colony.js);
        // the plague weakens a colony but cannot exterminate it
        if (c.pop < 1) c.pop = 1;
        if (c.plagueProgress >= c.plagueNeed) {
          c.plague = false; c.quarantine = false;
          notices.push({ type: 'event', good: true, name: 'Cure Found', text: 'The laboratories of ' + s.name + ' have synthesized a cure. The quarantine is lifted.' });
        }
      }
      if (c.novaThreat) {
        var rp2 = HOO.Colony.rawProduction(emp, s) * (c.alloc.tech / 100 + 0.3);
        c.novaProgress += rp2;
        c.novaYears--;
        if (c.novaProgress >= c.novaNeed) {
          c.novaThreat = false;
          notices.push({ type: 'event', good: true, name: 'Star Stabilized', text: 'The primary of ' + s.name + ' has been stabilized. The system is safe.' });
        } else if (c.novaYears <= 0) {
          c.pop = Math.max(0, c.pop * 0.1);
          c.factories = Math.max(0, c.factories * 0.05);
          c.novaThreat = false;
          notices.push({ type: 'event', good: false, name: 'Super Nova', text: 'The star of ' + s.name + ' has erupted. The colony lies in ashes.' });
          if (c.pop < 1) destroyColony(g, s);
        }
      }
    });

    return notices;
  }

  HOO.EventsRun = {
    maybeFire: maybeFire, progress: progress,
    buildMonsterBattle: buildMonsterBattle, monsterBattleResolved: monsterBattleResolved
  };
})();
