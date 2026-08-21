/* Hamster of Orion — espionage & sabotage (manual p.43 tables implemented exactly) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  function spyCost(emp, existing) {
    var race = HOO.DATA.raceById[emp.raceId];
    var base = 25 + 2 * HOO.State.techLevel(emp, 'computers');
    if (race.spyCostHalf) base /= 2;
    return base * Math.pow(2, existing);
  }

  // yearly: convert spy allocations into new networks
  function fundSpies(g, emp) {
    Object.keys(emp.spies).forEach(function (k) {
      var sp = emp.spies[k];
      var target = g.empires[k];
      if (!target || target.dead) { delete emp.spies[k]; return; }
      if (!sp.alloc) return;
      var spend = sp.alloc / 100 * (emp.economy ? emp.economy.totalRaw : 0);
      sp.fund = (sp.fund || 0) + spend;
      var cost = spyCost(emp, sp.count);
      while (sp.fund >= cost && sp.count < 12) {
        sp.fund -= cost;
        sp.count++;
        cost = spyCost(emp, sp.count);
      }
    });
  }

  // resolve one empire's counter-intelligence + enemy infiltration for the year
  function resolveAgainst(g, defender) {
    var notices = [];
    var race = HOO.DATA.raceById[defender.raceId];
    var secBonus = (defender.securityAlloc || 0) * 2 + (race.securityBonus || 0);
    var defLv = HOO.State.techLevel(defender, 'computers');

    g.empires.forEach(function (spyEmp) {
      if (spyEmp.dead || spyEmp.id === defender.id) return;
      var sp = spyEmp.spies[defender.id];
      if (!sp || sp.count <= 0) return;
      var spyRace = HOO.DATA.raceById[spyEmp.raceId];
      var attLv = HOO.State.techLevel(spyEmp, 'computers');
      var hiding = sp.mission === 'hide';

      var confessed = false;
      var infiltrators = 0;
      var framed = null;

      for (var i = 0; i < sp.count; i++) {
        // defender security roll per spy network — signed computer-tech
        // differential and the spy race's espionage bonus aid evasion (manual p.43)
        var roll = U.roll100() + secBonus + (defLv - attLv) - (spyRace.spyBonus || 0);
        if (hiding) roll -= 30;
        if (roll <= 0) {
          // mistaken identity: another race may be framed
          var others = g.empires.filter(function (o) { return !o.dead && o.id !== defender.id && o.id !== spyEmp.id; });
          if (others.length) framed = U.pick(others);
          infiltrators++;
        } else if (roll <= 30) {
          infiltrators++; // not discovered
        } else if (roll <= 50) {
          infiltrators++; // identified but not stopped
          notices.push({ to: defender.id, text: 'Security forces have identified ' + spyRace.adj + ' agents operating in our empire.' });
        } else if (roll <= 70) {
          // stopped, spy escapes
        } else if (roll <= 99) {
          sp.count--; i--; // eliminated (recount)
          if (sp.count < 0) sp.count = 0;
          notices.push({ to: defender.id, text: 'A ' + spyRace.adj + ' spy has been captured and eliminated.' });
          HOO.Diplomacy.adjust(g, defender.id, spyEmp.id, -6, true);
          break;
        } else {
          confessed = true;
          sp.count = 0; // the confession compromises the entire spy ring (manual p.43)
          notices.push({ to: defender.id, text: 'A captured ' + spyRace.adj + ' spy has confessed, exposing the entire network.' });
          HOO.Diplomacy.adjust(g, defender.id, spyEmp.id, -10, true);
          break;
        }
      }
      if (confessed || hiding || infiltrators <= 0) return;

      // one infiltration roll for the year (signed tech differential, manual p.43)
      var iroll = U.roll100() + (attLv - defLv) + (spyRace.spyBonus || 0);
      if (iroll < 85) return;
      // spectacular infiltrations may plant evidence implicating a third race
      if (iroll >= 100 && !framed) {
        var others2 = g.empires.filter(function (o) { return !o.dead && o.id !== defender.id && o.id !== spyEmp.id; });
        if (others2.length && U.chance(0.5)) framed = U.pick(others2);
      }
      var blame = framed || spyEmp;

      if (sp.mission === 'espionage') {
        var field = sp.techTarget || U.pick(HOO.CONST.FIELDS);
        var best = 0, bestTech = null;
        for (var s2 = 0; s2 < infiltrators; s2++) {
          var lvRoll = U.rint(1, Math.max(1, HOO.State.techLevel(defender, field)));
          if (lvRoll > best) best = lvRoll;
        }
        // steal the highest tech at or below that level that the spy lacks
        defender.techs[field].forEach(function (tid) {
          var t = HOO.DATA.techById[tid];
          if (t.level <= best && !spyEmp.techFlags[tid] && (!bestTech || t.level > bestTech.level)) bestTech = t;
        });
        if (bestTech) {
          HOO.State.grantTech(spyEmp, bestTech.id);
          notices.push({ to: spyEmp.id, text: 'Our operatives have stolen ' + bestTech.name + ' from the ' + HOO.DATA.raceById[defender.raceId].name + '.' });
          notices.push({ to: defender.id, text: HOO.DATA.raceById[blame.raceId].adj + ' spies have stolen our ' + bestTech.name + ' plans!' });
          HOO.Diplomacy.adjust(g, defender.id, blame.id, -8, true);
        }
      } else if (sp.mission === 'sabotage') {
        // choose a target colony: the ordered star if still held, else the largest
        var cols = HOO.Colony.colonies(g, defender.id);
        if (!cols.length) return;
        var target = null;
        if (sp.sabStarId !== undefined && sp.sabStarId !== null) {
          cols.forEach(function (c) { if (c.star.id === sp.sabStarId) target = c; });
        }
        if (!target) {
          cols.sort(function (a, b2) { return b2.colony.factories - a.colony.factories; });
          target = cols[0];
        }
        var mode = sp.sabTarget;
        if (!mode) {
          // auto-select: knock out defenses first, occasionally stir rebellion on big worlds
          if (target.colony.bases > 2) mode = 'bases';
          else if (target.colony.pop >= 40 && U.chance(0.25)) mode = 'rebellion';
          else mode = 'factories';
        }
        if (mode === 'bases' && target.colony.bases > 0) {
          var destroyed = 0;
          for (var k2 = 0; k2 < infiltrators; k2++) {
            if (U.chance(0.5)) destroyed += U.rint(1, 2); // manual p.44: 1-2 bases per success
          }
          destroyed = Math.min(target.colony.bases, destroyed);
          if (destroyed) {
            target.colony.bases -= destroyed;
            notices.push({ to: defender.id, text: 'Saboteurs have destroyed ' + destroyed + ' missile base(s) on ' + target.star.name + '. Evidence points to the ' + HOO.DATA.raceById[blame.raceId].name + '.' });
            notices.push({ to: spyEmp.id, text: 'Our saboteurs destroyed ' + destroyed + ' missile base(s) on ' + target.star.name + '.' });
            HOO.Diplomacy.adjust(g, defender.id, blame.id, -10, true);
          }
        } else if (mode === 'rebellion') {
          var pctRebels = 0;
          for (var k4 = 0; k4 < infiltrators; k4++) pctRebels += U.rint(1, 10);
          target.colony.rebels = (target.colony.rebels || 0) + Math.round(target.colony.pop * pctRebels / 100);
          if (target.colony.rebels > target.colony.pop / 2) {
            target.colony.inRebellion = true;
            notices.push({ to: defender.id, text: target.star.name + ' has erupted in open rebellion, incited by ' + HOO.DATA.raceById[blame.raceId].adj + ' provocateurs!' });
          } else {
            notices.push({ to: defender.id, text: 'Unrest is spreading on ' + target.star.name + '. Foreign agitators are suspected.' });
          }
          HOO.Diplomacy.adjust(g, defender.id, blame.id, -12, true);
        } else {
          var lost = 0;
          for (var k3 = 0; k3 < infiltrators; k3++) lost += U.rint(1, 5); // manual p.44: 1-5 factories
          lost = Math.min(Math.floor(target.colony.factories), lost);
          if (lost) {
            target.colony.factories -= lost;
            notices.push({ to: defender.id, text: 'Sabotage has levelled ' + lost + ' factories on ' + target.star.name + '. Evidence points to the ' + HOO.DATA.raceById[blame.raceId].name + '.' });
            notices.push({ to: spyEmp.id, text: 'Our saboteurs destroyed ' + lost + ' factories on ' + target.star.name + '.' });
            HOO.Diplomacy.adjust(g, defender.id, blame.id, -10, true);
          }
        }
      }
    });
    return notices;
  }

  function resolveAll(g) {
    var notices = [];
    g.empires.forEach(function (emp) { if (!emp.dead) fundSpies(g, emp); });
    g.empires.forEach(function (emp) {
      if (emp.dead) return;
      notices = notices.concat(resolveAgainst(g, emp));
    });
    return notices;
  }

  // UI/AI hook: set a spy network's standing orders against one empire.
  // orders = { mission: 'hide'|'espionage'|'sabotage',
  //            techTarget: field name or null (null = spy's choice),
  //            sabTarget: 'factories'|'bases'|'rebellion' or null (null = auto),
  //            sabStarId: star id or null (null = defender's largest colony) }
  function setSpyOrders(g, empId, targetEmpId, orders) {
    var emp = g.empires[empId];
    if (!emp) return null;
    var sp = emp.spies[targetEmpId] || (emp.spies[targetEmpId] = { count: 0, mission: 'hide', alloc: 0, fund: 0 });
    orders = orders || {};
    if (orders.mission) sp.mission = orders.mission;
    if ('techTarget' in orders) sp.techTarget = orders.techTarget;
    if ('sabTarget' in orders) sp.sabTarget = orders.sabTarget;
    if ('sabStarId' in orders) sp.sabStarId = orders.sabStarId;
    return sp;
  }

  HOO.Espionage = { spyCost: spyCost, resolveAll: resolveAll, setSpyOrders: setSpyOrders };
})();
