/* Hamster of Orion — bombardment, invasion, ground combat, colonization */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  // ---------- colonization ----------
  // capability travels with the colony ship's installed base module; designs
  // predating the field fall back to the empire-wide derived stat
  function designHostility(emp, dsg) {
    return dsg.colonyHostility === undefined ? emp.derived.maxHostility : dsg.colonyHostility;
  }

  // optional 4th arg: pass the fleet to require an actually-capable colony ship
  function canColonize(g, emp, star, fleet) {
    if (!star.planet || star.planet.colony) return false;
    if (star.orion && g.guardian.alive) return false;
    var def = HOO.CONST.PLANET_TYPES[star.planet.type];
    if (fleet) {
      for (var i = 0; i < 6; i++) {
        var dsg = emp.designs[i];
        if (fleet.ships[i] > 0 && dsg && dsg.hasColonyBase && designHostility(emp, dsg) >= def.hostility) return true;
      }
      return false;
    }
    return def.hostility <= emp.derived.maxHostility;
  }

  function colonize(g, empId, starId, fleet) {
    var emp = g.empires[empId];
    var star = g.stars[starId];
    if (!canColonize(g, emp, star, fleet)) return false;
    // find a colony-base ship in the fleet whose base module handles this world
    var def = HOO.CONST.PLANET_TYPES[star.planet.type];
    var slot = -1;
    for (var i = 0; i < 6; i++) {
      var dsg = emp.designs[i];
      if (fleet.ships[i] > 0 && dsg && dsg.hasColonyBase && designHostility(emp, dsg) >= def.hostility) { slot = i; break; }
    }
    if (slot < 0) return false;
    fleet.ships[slot]--;
    HOO.Fleet.cleanup(g);
    star.planet.colony = HOO.Colony.create(empId, star, 2, 0);
    star.explored[empId] = true;
    return true;
  }

  // ---------- bombardment ----------
  // total bomb ordnance across all ships in a fleet
  function fleetBombs(emp, f) {
    if (!f || !emp) return 0;
    var total = 0;
    f.ships.forEach(function (n, slot) {
      if (n <= 0) return;
      var dsg = emp.designs[slot];
      if (!dsg) return;
      dsg.weapons.forEach(function (w) {
        var t = HOO.DATA.techById[w.id];
        if (t && t.effect && (t.effect.wclass === 'bomb' || t.effect.wclass === 'bio')) {
          total += n * (w.count || 1);
        }
      });
    });
    return total;
  }

  function canBombard(g, attId, star) {
    var emp = g.empires[attId];
    if (!emp) return false;
    var c = star.planet && star.planet.colony;
    if (!c || c.empire === attId) return false;
    var fleet = HOO.Fleet.fleetAt(g, attId, star.id);
    if (!fleet) return false;
    if (fleet.bombardedYear === g.year) return false;
    return fleetBombs(emp, fleet) > 0;
  }

  // one year's orbital bombardment; returns report
  function bombard(g, attId, star) {
    var emp = g.empires[attId];
    var c = star.planet && star.planet.colony;
    if (!c) return null;
    var defEmp = g.empires[c.empire];
    var fleet = HOO.Fleet.fleetAt(g, attId, star.id);
    if (!fleet) return null;
    if (!canBombard(g, attId, star)) return null;

    fleet.bombardedYear = g.year;

    var shield = star.inNebula ? 0 : c.shield;
    var damage = 0, bioKill = 0, sizeLoss = 0;

    fleet.ships.forEach(function (n, slot) {
      var dsg = emp.designs[slot];
      if (!dsg || n <= 0) return;
      dsg.weapons.forEach(function (w) {
        var t = HOO.DATA.techById[w.id];
        var e = t.effect;
        var shots = n * w.count * (e.autofire || 1);
        var perShot;
        if (e.wclass === 'bio') {
          var kill = Math.max(0, e.dmax - defEmp.derived.antidote);
          bioKill += shots * kill * 0.5;
          sizeLoss += shots * kill * 0.25;
          return;
        }
        // same to-hit math as tactical combat (bases defend at 1)
        var need = HOO.Combat.hitNeeded(dsg.attack + (e.hitBonus || 0) + (e.targeting || 0), 1);
        var pHit = U.clamp((101 - need) / 100, 0, 1);
        if (e.wclass === 'bomb') perShot = Math.max(0, (e.dmin + e.dmax) / 2 - shield);
        else return; // only bombs and bio weapons can be used for orbital bombardment now
        damage += shots * perShot * pHit;
      });
    });

    var report = { popKilled: 0, factoriesLost: 0, basesLost: 0, bioUsed: bioKill > 0 };

    // vs missile bases first: shield is already subtracted per hit above, so
    // bases fall at BASE_HITS apiece just as they do in tactical combat
    if (c.bases > 0 && damage > 0) {
      var baseDmg = damage * 0.5;
      var baseKills = baseDmg / HOO.CONST.BASE_HITS;
      var whole = Math.floor(baseKills);
      if (U.chance(baseKills - whole)) whole++; // fractional kills accumulate by chance
      var basesLost = Math.min(c.bases, whole);
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
    // the bomber is the aggressor — declare in that orientation so the
    // third-party ripple punishes the attacker, not the victim
    if (!defEmp.relations[attId].war) HOO.Diplomacy.declareWar(g, attId, c.empire);

    if (c.pop <= 0.5) {
      star.planet.colony = null;
      report.destroyed = true;
      g.empires.forEach(function (o) {
        if (o.id === attId || o.dead) return;
        HOO.Diplomacy.adjust(g, o.id, attId, -8, true);
      });
      // bombing out the last colony ends the empire now, exactly as an invasion
      // or a monster does — otherwise its fleets fight on for another year and
      // the victory/defeat check is a turn late
      if (!HOO.Colony.colonies(g, defEmp.id).length) HOO.Turn.eliminateEmpire(g, defEmp);
    }
    return report;
  }

  // ---------- transports under fire, landing, ground combat ----------

  // defensive fire from hostile ships in orbit (plus the colony's missile bases
  // when invading); transports draw fire regardless of who owns the planet
  function orbitalFirepower(g, t, star, defC) {
    var fp = 0;
    HOO.Fleet.fleetsAt(g, star.id).forEach(function (f) {
      if (f.empire === t.empire) return;
      var fe = g.empires[f.empire];
      var rel = fe.relations[t.empire];
      if (!rel || !rel.war) return;
      f.ships.forEach(function (n, slot) {
        var dsg = fe.designs[slot];
        if (dsg && n > 0) dsg.weapons.forEach(function (w) {
          var e = HOO.DATA.techById[w.id].effect;
          if (e.wclass !== 'bomb' && e.wclass !== 'bio') fp += n * w.count * (e.dmax || 1) * 0.15;
        });
      });
    });
    if (defC) fp += defC.bases * 8;
    return fp;
  }

  // survivors of the descent; combat transporters beam troops past the guns
  // unless the defending colony projects an interdiction field
  function runGauntlet(g, emp, pop, firepower, defEmp) {
    if (firepower <= 0) return pop;
    var armor = emp.derived.bestArmor;
    var hitsPer = 15 * (armor ? armor.effect.mult : 1);
    var speed = Math.max(1, Math.floor((emp.derived.warp - 1) / 2));
    var lossFrac = U.clamp(firepower / (pop * hitsPer * speed * 4), 0, 0.95);
    if (emp.derived.hasCombatTransporters && !(defEmp && defEmp.derived.hasInterdictor)) lossFrac *= 0.5;
    return Math.max(0, Math.round(pop * (1 - lossFrac)));
  }

  function resolveLanding(g, t) {
    var star = g.stars[t.to];
    var emp = g.empires[t.empire];
    var pop = t.pop;
    var notices = [];

    if (!star.planet) return notices;
    var c = star.planet.colony;

    // own colony: reinforce — hostile ships in orbit still fire on the way down
    if (c && c.empire === t.empire) {
      var landed0 = runGauntlet(g, emp, pop, orbitalFirepower(g, t, star, null), null);
      if (landed0 <= 0) {
        notices.push({ type: 'ground', text: 'Transports bound for ' + star.name + ' were annihilated in orbit.' });
        return notices;
      }
      var mp = HOO.Colony.maxPop(emp, star);
      if (c.inRebellion) {
        // loyalists fight rebels; every unit lost on either side is a million colonists
        var rebels = c.rebels || Math.ceil(c.pop * 0.3);
        var rres = groundBattle(landed0, emp.derived.groundBonus, rebels, 0);
        var rebelDead = rebels - rres.defendersLeft;
        if (rres.attackerWon) {
          c.inRebellion = false; c.rebels = 0;
          // dead rebels come out of the census; surviving loyalists join it
          c.pop = Math.min(mp * 1.2, Math.max(1, c.pop - rebelDead) + rres.attackersLeft);
          notices.push({ type: 'ground', text: 'Loyalist forces have restored order on ' + star.name + '.' });
        } else {
          c.rebels = rres.defendersLeft;
          c.pop = Math.max(1, c.pop - rebelDead); // the loyalist landing force is spent
        }
      } else {
        c.pop = Math.min(mp * 1.2, c.pop + landed0);
      }
      return notices;
    }

    // empty planet: colonists lost (need colony base) unless colony exists
    if (!c) {
      notices.push({ type: 'ground', text: 'Transports arrived at ' + star.name + ' but found no colony. The colonists were lost.' });
      return notices;
    }

    // enemy colony: run the gauntlet of ships + bases (invader is the aggressor)
    var defEmp = g.empires[c.empire];
    if (!emp.relations[c.empire].war) HOO.Diplomacy.declareWar(g, t.empire, c.empire);

    var landed = runGauntlet(g, emp, pop, orbitalFirepower(g, t, star, c), defEmp);

    if (landed <= 0) {
      notices.push({ type: 'ground', text: 'The invasion force bound for ' + star.name + ' was annihilated in orbit.' });
      return notices;
    }

    var result = groundBattle(landed, emp.derived.groundBonus, Math.round(c.pop), defEmp.derived.groundBonus);
    if (result.attackerWon) {
      var factLeft = Math.floor(c.factories * 0.6);
      // capture: chance to loot technology
      var stolen = lootTech(g, emp, defEmp);
      var nc = HOO.Colony.create(t.empire, star, Math.max(1, result.attackersLeft), factLeft);
      nc.controls = HOO.CONST.BASE_CONTROLS;
      // plagues and impending novas threaten the planet, not the flag over it
      if (c.plague) {
        nc.plague = true; nc.quarantine = true;
        nc.plagueNeed = c.plagueNeed; nc.plagueProgress = c.plagueProgress || 0;
      }
      if (c.novaThreat) {
        nc.novaThreat = true; nc.novaNeed = c.novaNeed;
        nc.novaProgress = c.novaProgress || 0; nc.novaYears = c.novaYears;
      }
      star.planet.colony = nc;
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
    fleetBombs: fleetBombs, canBombard: canBombard,
    resolveLanding: resolveLanding, groundBattle: groundBattle, lootTech: lootTech
  };
})();
