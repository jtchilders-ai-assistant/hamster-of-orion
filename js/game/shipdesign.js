/* Hamster of Orion — ship design (manual: The Ship Design Screen / Ship Designs) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  var HULL_IDX = { small: 0, medium: 1, large: 2, huge: 3 };

  // per-hull scaling for computers / shields / ECM (MOO scales these by hull class)
  var HULL_COMP_SIZE = { small: 2, medium: 5, large: 12, huge: 35 };
  var HULL_COMP_COST = { small: 3, medium: 7, large: 18, huge: 50 };
  var HULL_SHIELD_SIZE = { small: 3, medium: 8, large: 20, huge: 60 };
  var HULL_SHIELD_COST = { small: 2.5, medium: 6, large: 16, huge: 45 };

  function hull(id) {
    for (var i = 0; i < HOO.DATA.HULLS.length; i++) if (HOO.DATA.HULLS[i].id === id) return HOO.DATA.HULLS[i];
    return HOO.DATA.HULLS[0];
  }

  // ---- component catalogs available to an empire ----
  function knownOf(emp, pred) {
    return HOO.State.allKnown(emp, pred).sort(function (a, b) { return a.level - b.level; });
  }
  function engines(emp) { return knownOf(emp, function (t) { return t.effect.type === 'engine'; }); }
  function computers(emp) { return knownOf(emp, function (t) { return t.effect.type === 'computer'; }); }
  function shields(emp) { return knownOf(emp, function (t) { return t.effect.type === 'shield'; }); }
  function ecms(emp) { return knownOf(emp, function (t) { return t.effect.type === 'ecm'; }); }
  function armors(emp) { return knownOf(emp, function (t) { return t.effect.type === 'armor'; }); }
  function weapons(emp) { return knownOf(emp, function (t) { return t.effect.type === 'weapon'; }); }
  function specials(emp) {
    return knownOf(emp, function (t) { return t.effect.type === 'special' && HOO.DATA.SPECIAL_STATS[t.effect.special]; });
  }

  // ---- sizes & costs with miniaturization ----
  function weaponSize(emp, t) { return Math.max(1, Math.round(HOO.State.miniSize(emp, t, t.effect.size))); }
  function weaponCost(emp, t) { return Math.max(0.25, HOO.State.miniCost(emp, t, t.effect.cost)); }
  function specialStats(emp, t) {
    var st = HOO.DATA.SPECIAL_STATS[t.effect.special];
    return {
      size: Math.max(1, Math.round(HOO.State.miniSize(emp, t, st.size))),
      power: st.power,
      cost: Math.max(0.5, HOO.State.miniCost(emp, t, st.cost))
    };
  }
  function compSize(emp, t, hullId) { // computers & ecm
    var mark = t.effect.mark;
    return Math.max(1, Math.round(HOO.State.miniSize(emp, t, mark * HULL_COMP_SIZE[hullId])));
  }
  function compCost(emp, t, hullId) {
    return Math.max(0.5, HOO.State.miniCost(emp, t, t.effect.mark * HULL_COMP_COST[hullId]));
  }
  function shieldSize(emp, t, hullId) {
    return Math.max(1, Math.round(HOO.State.miniSize(emp, t, t.effect.cls * HULL_SHIELD_SIZE[hullId])));
  }
  function shieldCost(emp, t, hullId) {
    return Math.max(0.5, HOO.State.miniCost(emp, t, t.effect.cls * HULL_SHIELD_COST[hullId]));
  }
  function armorSize(emp, t, h, dbl) {
    var s = h.space * 0.08 * (dbl ? 2 : 1);
    return Math.round(s);
  }
  function armorCost(emp, t, h, dbl) {
    var idx = Math.max(1, Math.round(t.effect.mult * 4 - 3)); // 1..7
    return Math.max(0, (idx - 1) * h.cost * 0.08 * (dbl ? 2 : 1));
  }

  /*
    design spec: { name, hullId, engineId, computerId|null, shieldId|null, ecmId|null,
                   armorId, doubleArmor, weapons:[{id,count}] (max 4), specials:[techIds] (max 3) }
    returns computed design object or null if invalid
  */
  function compute(emp, spec) {
    var h = hull(spec.hullId);
    var conLv = HOO.State.techLevel(emp, 'construction');
    var space = h.space * (1 + conLv / 100);
    var used = 0, powerNeed = 0, cost = h.cost;

    var eng = HOO.DATA.techById[spec.engineId];
    if (!eng) return null;
    var warp = eng.effect.warp;

    var comp = spec.computerId ? HOO.DATA.techById[spec.computerId] : null;
    var shld = spec.shieldId ? HOO.DATA.techById[spec.shieldId] : null;
    var ecm = spec.ecmId ? HOO.DATA.techById[spec.ecmId] : null;
    var arm = HOO.DATA.techById[spec.armorId];
    if (!arm) return null;

    if (comp) { used += compSize(emp, comp, h.id); powerNeed += comp.effect.mark * HULL_COMP_SIZE[h.id] * 0.5; cost += compCost(emp, comp, h.id); }
    if (shld) { used += shieldSize(emp, shld, h.id); powerNeed += shld.effect.cls * HULL_SHIELD_SIZE[h.id] * 0.5; cost += shieldCost(emp, shld, h.id); }
    if (ecm) { used += compSize(emp, ecm, h.id); powerNeed += ecm.effect.mark * HULL_COMP_SIZE[h.id] * 0.5; cost += compCost(emp, ecm, h.id); }
    used += armorSize(emp, arm, h, spec.doubleArmor);
    cost += armorCost(emp, arm, h, spec.doubleArmor);

    var wlist = [];
    (spec.weapons || []).slice(0, 4).forEach(function (w) {
      if (!w || !w.id || !w.count) return;
      var t = HOO.DATA.techById[w.id];
      if (!t || t.effect.type !== 'weapon') return;
      var sz = weaponSize(emp, t);
      used += sz * w.count;
      powerNeed += (t.effect.power || 0) * w.count;
      cost += weaponCost(emp, t) * w.count;
      wlist.push({ id: w.id, count: w.count });
    });

    var slist = [];
    (spec.specials || []).slice(0, 3).forEach(function (sid) {
      var t = HOO.DATA.techById[sid];
      if (!t || t.effect.type !== 'special') return;
      var st = specialStats(emp, t);
      used += st.size; powerNeed += st.power; cost += st.cost;
      slist.push(sid);
    });

    // engines: power all devices + combat thrust
    var man = warp; // maneuverability from engine class
    var hasStab = slist.some(function (s) { return HOO.DATA.techById[s].effect.special === 'inertialStab'; });
    var hasNull = slist.some(function (s) { return HOO.DATA.techById[s].effect.special === 'inertialNull'; });
    if (hasStab) man += 2;
    if (hasNull) man += 4;

    powerNeed += h.baseManeuverCost * warp;
    // each engine: 10 tons, 10 x warp power (fractional engines allowed)
    var perEngine = warp * 10;
    var nEngines = Math.max(0.2, powerNeed / perEngine);
    var engineSize = Math.max(2, HOO.State.miniSize(emp, eng, 10));
    used += nEngines * engineSize;
    cost += nEngines * Math.max(0.5, HOO.State.miniCost(emp, eng, warp * 2));

    var race = HOO.DATA.raceById[emp.raceId];
    var hits = Math.round(h.hits * arm.effect.mult * (spec.doubleArmor ? 1.5 : 1));
    var attack = (comp ? comp.effect.mark : 0) + (race.shipAttack || 0);
    var defense = h.defense + man + (race.shipDefense || 0);
    var initiative = man + (comp ? comp.effect.mark : 0) + (race.initBonus || 0);
    var hasScanner = slist.some(function (s) { return HOO.DATA.techById[s].effect.special === 'battleScanner'; });
    if (hasScanner) { initiative += 3; attack += 1; }

    var range = 0; // extra fuel range
    if (slist.some(function (s) { return HOO.DATA.techById[s].effect.special === 'reserveFuel'; })) range = 3;

    return {
      name: spec.name, hullId: h.id, engineId: spec.engineId,
      computerId: spec.computerId || null, shieldId: spec.shieldId || null, ecmId: spec.ecmId || null,
      armorId: spec.armorId, doubleArmor: !!spec.doubleArmor,
      weapons: wlist, specials: slist,
      warp: warp, maneuver: man,
      combatSpeed: Math.max(1, Math.floor(man / 2)),
      hits: hits, attack: attack, defense: defense, initiative: initiative,
      shieldCls: shld ? shld.effect.cls : 0, ecmMark: ecm ? ecm.effect.mark : 0,
      spaceUsed: Math.round(used), spaceTotal: Math.round(space),
      cost: Math.max(2, Math.round(cost)),
      extraRange: range,
      hasColonyBase: slist.some(function (s) { return HOO.DATA.techById[s].effect.special === 'colonyBase'; }),
      valid: used <= space
    };
  }

  function bestOf(emp, list) { return list.length ? list[list.length - 1] : null; }

  function createStarterDesigns(emp) {
    var eng = engines(emp)[0];
    var comp = computers(emp)[0];
    var arm = armors(emp)[0];
    var laser = HOO.DATA.techById['laser'];

    emp.designs[0] = compute(emp, {
      name: 'Scout', hullId: 'small', engineId: eng.id, computerId: null, shieldId: null, ecmId: null,
      armorId: arm.id, doubleArmor: false, weapons: [], specials: ['reserve_fuel_tanks_t']
    });
    // reserve fuel tanks may not exist as a starting tech: find it
    if (!emp.designs[0] || !emp.designs[0].valid || !emp.designs[0].extraRange) {
      var rft = null;
      Object.keys(HOO.DATA.techById).forEach(function (id) {
        var t = HOO.DATA.techById[id];
        if (t.effect && t.effect.type === 'special' && t.effect.special === 'reserveFuel') rft = t;
      });
      // scouts traditionally carry reserve tanks even before researched
      emp.designs[0] = compute(emp, {
        name: 'Scout', hullId: 'small', engineId: eng.id, computerId: null, shieldId: null, ecmId: null,
        armorId: arm.id, doubleArmor: false, weapons: [], specials: rft ? [rft.id] : []
      });
    }
    emp.designs[1] = compute(emp, {
      name: 'Colony Ship', hullId: 'large', engineId: eng.id, computerId: null, shieldId: null, ecmId: null,
      armorId: arm.id, doubleArmor: false, weapons: [],
      specials: ['colony_base']
    });
    emp.designs[2] = compute(emp, {
      name: 'Fighter', hullId: 'small', engineId: eng.id, computerId: comp ? comp.id : null, shieldId: null, ecmId: null,
      armorId: arm.id, doubleArmor: false, weapons: laser ? [{ id: 'laser', count: 1 }] : [], specials: []
    });
  }

  // scrap a design slot: remove all ships of it, salvage 25% to reserve
  function scrapDesign(g, emp, slot) {
    var dsg = emp.designs[slot];
    if (!dsg) return;
    var salvage = 0;
    g.fleets.forEach(function (f) {
      if (f.empire !== emp.id) return;
      salvage += (f.ships[slot] || 0) * dsg.cost * 0.25;
      f.ships[slot] = 0;
    });
    g.fleets = g.fleets.filter(function (f) {
      return f.ships.some(function (n) { return n > 0; });
    });
    emp.reserve += salvage;
    emp.designs[slot] = null;
    // colonies building this design switch to first available
    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      if (e.colony.buildDesign === slot) {
        var first = 0;
        for (var i = 0; i < 6; i++) if (emp.designs[i]) { first = i; break; }
        e.colony.buildDesign = first;
        e.colony.shipProgress = 0;
      }
    });
  }

  HOO.ShipDesign = {
    hull: hull, compute: compute, createStarterDesigns: createStarterDesigns, scrapDesign: scrapDesign,
    engines: engines, computers: computers, shields: shields, ecms: ecms, armors: armors,
    weapons: weapons, specials: specials,
    weaponSize: weaponSize, weaponCost: weaponCost, specialStats: specialStats,
    compSize: compSize, compCost: compCost, shieldSize: shieldSize, shieldCost: shieldCost,
    armorSize: armorSize, armorCost: armorCost, bestOf: bestOf
  };
})();
