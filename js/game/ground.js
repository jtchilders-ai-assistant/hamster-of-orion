/* Hamster of Orion — bombardment, invasion, ground combat, colonization */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  // ---------- colonization ----------
  function canColonize(g, emp, star) {
    if (!star.planet || star.planet.colony) return false;
    if (star.orion && g.guardian.alive) return false;
    var def = HOO.CONST.PLANET_TYPES[star.planet.type];
    return def.hostility <= emp.derived.maxHostility;
  }

  function colonize(g, empId, starId, fleet) {
    var emp = g.empires[empId];
    var star = g.stars[starId];
    if (!canColonize(g, emp, star)) return false;
    // find a colony-base ship in the fleet
    var slot = -1;
    for (var i = 0; i < 6; i++) {
      var dsg = emp.designs[i];
      if (fleet.ships[i] > 0 && dsg && dsg.hasColonyBase) { slot = i; break; }
    }
    if (slot < 0) return false;
    fleet.ships[slot]--;
    HOO.Fleet.cleanup(g);
    star.planet.colony = HOO.Colony.create(empId, star, 2, 0);
    star.explored[empId] = true;
    return true;
  }

  // ---------- bombardment ----------
  // one year's orbital bombardment; returns report
  function bombard(g, attId, star) {
    var emp = g.empires[attId];
    var c = star.planet.colony;
    if (!c) return null;
    var defEmp = g.empires[c.empire];
    var fleet = HOO.Fleet.fleetAt(g, attId, star.id);
    if (!fleet) return null;

    var shield = star.inNebula ? 0 : c.shield;
    var damage = 0, bioKill = 0, sizeLoss = 0;

    fleet.ships.forEach(function (n, slot) {
      var dsg = emp.designs[slot];
      if (!dsg || n <= 0) return;
      dsg.weapons.forEach(function (w) {
        var t = HOO.DATA.techById[w.id];
        var e = t.effect;
        var shots = n * w.count;
        var perShot;
        if (e.wclass === 'bio') {
          var kill = Math.max(0, e.dmax - defEmp.derived.antidote);
          bioKill += shots * kill * 0.5;
          sizeLoss += shots * kill * 0.25;
          return;
        }
        if (e.wclass === 'bomb') perShot = Math.max(0, (e.dmin + e.dmax) / 2 - shield);
        else if (e.wclass === 'missile') perShot = Math.max(0, e.dmax - shield) * 0.6; // limited racks
        else if (e.wclass === 'torpedo') perShot = Math.max(0, (e.dmax * 0.5) - shield) * 0.5;
        else perShot = Math.max(0, ((e.dmin + e.dmax) / 2) * 0.5 - shield) * 0.5; // beams halved by atmosphere
        damage += shots * perShot;
      });
    });

    var report = { popKilled: 0, factoriesLost: 0, basesLost: 0, bioUsed: bioKill > 0 };

    // vs missile bases first
    if (c.bases > 0 && damage > 0) {
      var baseDmg = damage * 0.5;
      var basesLost = Math.min(c.bases, Math.floor(baseDmg / (HOO.CONST.BASE_HITS + shield * 4)));
      c.bases -= basesLost;
      report.basesLost = basesLost;
      report.popKilled += damage / 400;
      report.factoriesLost += damage / 100;
    } else if (damage > 0) {
      report.popKilled += damage / 200;
      report.factoriesLost += damage / 50;
    }

    if (bioKill > 0) {
      report.popKilled += bioKill;
      star.planet.size = Math.max(10, star.planet.size - sizeLoss);
      star.planet.baseSize = Math.max(10, star.planet.baseSize - sizeLoss);
      // everyone despises biological weapons
      g.empires.forEach(function (o) {
        if (o.id === attId || o.dead) return;
        HOO.Diplomacy.adjust(g, o.id, attId, -25, true);
      });
    }

    report.popKilled = Math.min(c.pop, report.popKilled);
    report.factoriesLost = Math.min(c.factories, report.factoriesLost);
    c.pop -= report.popKilled;
    c.factories -= report.factoriesLost;

    HOO.Diplomacy.adjust(g, c.empire, attId, -20, true);
    if (!defEmp.relations[attId].war) HOO.Diplomacy.declareWar(g, c.empire, attId);

    if (c.pop <= 0.5) {
      star.planet.colony = null;
      report.destroyed = true;
      g.empires.forEach(function (o) {
        if (o.id === attId || o.dead) return;
        HOO.Diplomacy.adjust(g, o.id, attId, -8, true);
      });
    }
    return report;
  }

  // ---------- transports under fire, landing, ground combat ----------
  function resolveLanding(g, t) {
    var star = g.stars[t.to];
    var emp = g.empires[t.empire];
    var pop = t.pop;
    var notices = [];

    if (!star.planet) return notices;
    var c = star.planet.colony;

    // own colony: reinforce
    if (c && c.empire === t.empire) {
      var mp = HOO.Colony.maxPop(emp, star);
      c.pop = Math.min(mp * 1.2, c.pop + pop);
      if (c.inRebellion) {
        // loyalists fight rebels
        var rebels = c.rebels || Math.ceil(c.pop * 0.3);
        var result = groundBattle(pop, emp.derived.groundBonus, rebels, 0);
        if (result.attackerWon) {
          c.inRebellion = false; c.rebels = 0;
          notices.push({ type: 'ground', text: 'Loyalist forces have restored order on ' + star.name + '.' });
        } else {
          c.rebels = result.defendersLeft;
          c.pop = Math.max(1, c.pop - pop);
        }
      }
      return notices;
    }

    // empty planet: colonists lost (need colony base) unless colony exists
    if (!c) {
      notices.push({ type: 'ground', text: 'Transports arrived at ' + star.name + ' but found no colony. The colonists were lost.' });
      return notices;
    }

    // enemy colony: run the gauntlet of ships + bases
    var defEmp = g.empires[c.empire];
    if (!emp.relations[c.empire].war) HOO.Diplomacy.declareWar(g, t.empire, c.empire);

    var defFleets = HOO.Fleet.fleetsAt(g, star.id).filter(function (f) { return f.empire === c.empire; });
    var firepower = c.bases * 8;
    defFleets.forEach(function (f) {
      f.ships.forEach(function (n, slot) {
        var dsg = defEmp.designs[slot];
        if (dsg && n > 0) dsg.weapons.forEach(function (w) {
          var e = HOO.DATA.techById[w.id].effect;
          if (e.wclass !== 'bomb' && e.wclass !== 'bio') firepower += n * w.count * (e.dmax || 1) * 0.15;
        });
      });
    });
    var armor = emp.derived.bestArmor;
    var hitsPer = 15 * (armor ? armor.effect.mult : 1);
    var speed = Math.max(1, Math.floor((emp.derived.warp - 1) / 2));
    var lossFrac = U.clamp(firepower / (pop * hitsPer * speed * 4), 0, 0.95);
    if (emp.derived.hasCombatTransporters) lossFrac *= 0.5;
    var landed = Math.max(0, Math.round(pop * (1 - lossFrac)));

    if (landed <= 0) {
      notices.push({ type: 'ground', text: 'The invasion force bound for ' + star.name + ' was annihilated in orbit.' });
      return notices;
    }

    var result = groundBattle(landed, emp.derived.groundBonus, Math.round(c.pop), defEmp.derived.groundBonus);
    if (result.attackerWon) {
      var factLeft = Math.floor(c.factories * 0.6);
      // capture: chance to loot technology
      var stolen = lootTech(g, emp, defEmp);
      star.planet.colony = HOO.Colony.create(t.empire, star, Math.max(1, result.attackersLeft), factLeft);
      star.planet.colony.controls = HOO.CONST.BASE_CONTROLS;
      star.explored[t.empire] = true;
      notices.push({
        type: 'ground',
        text: HOO.DATA.raceById[emp.raceId].name + ' ground forces have taken ' + star.name + '.' +
          (stolen ? ' Captured archives yielded ' + stolen.name + '.' : '')
      });
      HOO.Diplomacy.adjust(g, defEmp.id, emp.id, -30, true);
      if (!HOO.Colony.colonies(g, defEmp.id).length) HOO.Turn.eliminateEmpire(g, defEmp);
    } else {
      c.pop = Math.max(1, result.defendersLeft);
      notices.push({ type: 'ground', text: 'The assault on ' + star.name + ' has failed. The defenders hold.' });
    }
    return notices;
  }

  // series of engagements, each side rolls d100 + bonus, loser loses 1 unit
  function groundBattle(attackers, attBonus, defenders, defBonus) {
    var a = attackers, d = defenders;
    var guard = 0;
    while (a > 0 && d > 0 && guard++ < 4000) {
      var ra = U.roll100() + attBonus;
      var rd = U.roll100() + defBonus;
      if (ra > rd) d--;
      else if (rd > ra) a--;
      else { a--; d--; }
    }
    return { attackerWon: d <= 0 && a > 0, attackersLeft: a, defendersLeft: d };
  }

  function lootTech(g, emp, victim) {
    // chance to find one technology the victor lacks
    var candidates = [];
    HOO.CONST.FIELDS.forEach(function (f) {
      victim.techs[f].forEach(function (tid) {
        if (!emp.techFlags[tid]) candidates.push(tid);
      });
    });
    if (candidates.length && U.chance(0.6)) {
      var tid = U.pick(candidates);
      HOO.State.grantTech(emp, tid);
      return HOO.DATA.techById[tid];
    }
    return null;
  }

  HOO.Ground = {
    canColonize: canColonize, colonize: colonize, bombard: bombard,
    resolveLanding: resolveLanding, groundBattle: groundBattle, lootTech: lootTech
  };
})();
