/* Hamster of Orion — game state, constants, tech helpers, save/load */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  // ---------------- constants ----------------

  HOO.CONST = {
    START_YEAR: 2623,
    GALAXY_SIZES: {
      small: { stars: 24, w: 900, h: 640, name: 'Small' },
      medium: { stars: 48, w: 1200, h: 860, name: 'Medium' },
      large: { stars: 70, w: 1500, h: 1060, name: 'Large' },
      huge: { stars: 108, w: 1900, h: 1340, name: 'Huge' }
    },
    DIFFICULTIES: {
      simple: { name: 'Simple', aiProd: 0.6, researchFactor: 0.8, aiHostility: 0.5 },
      easy: { name: 'Easy', aiProd: 0.8, researchFactor: 0.9, aiHostility: 0.75 },
      average: { name: 'Average', aiProd: 1.0, researchFactor: 1.0, aiHostility: 1.0 },
      hard: { name: 'Hard', aiProd: 1.3, researchFactor: 1.1, aiHostility: 1.25 },
      impossible: { name: 'Impossible', aiProd: 1.6, researchFactor: 1.25, aiHostility: 1.5 }
    },
    // 14 environments. hostility: 0 = standard; 1..6 need controlled-env tech (see tech.js ladder)
    PLANET_TYPES: {
      terran: { name: 'Terran', size: [80, 100], hostility: 0, order: 13 },
      jungle: { name: 'Jungle', size: [60, 90], hostility: 0, order: 12 },
      ocean: { name: 'Ocean', size: [55, 85], hostility: 0, order: 11 },
      arid: { name: 'Arid', size: [45, 75], hostility: 0, order: 10 },
      steppe: { name: 'Steppe', size: [40, 70], hostility: 0, order: 9 },
      desert: { name: 'Desert', size: [35, 60], hostility: 0, order: 8 },
      minimal: { name: 'Minimal', size: [25, 50], hostility: 0, order: 7 },
      barren: { name: 'Barren', size: [25, 45], hostility: 1, order: 6 },
      tundra: { name: 'Tundra', size: [20, 40], hostility: 2, order: 5 },
      dead: { name: 'Dead', size: [15, 35], hostility: 3, order: 4 },
      inferno: { name: 'Inferno', size: [15, 30], hostility: 4, order: 3 },
      toxic: { name: 'Toxic', size: [10, 25], hostility: 5, order: 2 },
      radiated: { name: 'Radiated', size: [10, 20], hostility: 6, order: 1 }
    },
    SPECIALS: {
      none: { name: '', prodMult: 1, growth: 1 },
      ultrapoor: { name: 'Ultra Poor', prodMult: 1 / 3, growth: 1 },
      poor: { name: 'Mineral Poor', prodMult: 0.5, growth: 1 },
      artifact: { name: 'Artifacts', prodMult: 1, growth: 1, research: 2 },
      rich: { name: 'Mineral Rich', prodMult: 2, growth: 1 },
      ultrarich: { name: 'Ultra Rich', prodMult: 3, growth: 1 },
      fertile: { name: 'Fertile', prodMult: 1, growth: 1.5 },
      gaia: { name: 'Gaia', prodMult: 1, growth: 2 },
      orion: { name: 'Throne of the Ancients', prodMult: 3, growth: 1, research: 4 }
    },
    FIELDS: ['computers', 'construction', 'forceFields', 'planetology', 'propulsion', 'weapons'],
    FIELD_NAMES: {
      computers: 'Computers', construction: 'Construction', forceFields: 'Force Fields',
      planetology: 'Planetology', propulsion: 'Propulsion', weapons: 'Weapons'
    },
    BASE_HITS: 50,           // missile base hit points
    BASE_RANGE: 3,           // starting fuel range (parsecs)
    BASE_SCANNER: 3,         // colony scanner range at start
    FACTORY_BASE_COST: 10,
    BASE_CONTROLS: 2,        // factories per colonist at start
    MAX_DESIGNS: 6,
    COMBAT_COLS: 10,
    COMBAT_ROWS: 8,
    COMBAT_MAX_TURNS: 50
  };

  // ---------------- game object ----------------

  HOO.game = null;

  // ---------------- tech helpers ----------------

  // empire tech list per field is an array of tech ids, in discovery order
  function knows(emp, techId) { return emp.techFlags[techId] === 1; }

  function techLevel(emp, field) {
    // manual: 80% of highest device level + number of devices known
    var list = emp.techs[field];
    if (!list || !list.length) return 1;
    var maxLv = 0;
    for (var i = 0; i < list.length; i++) {
      var t = HOO.DATA.techById[list[i]];
      if (t && t.level > maxLv) maxLv = t.level;
    }
    return Math.max(1, Math.round(0.8 * maxLv + list.length));
  }

  function grantTech(emp, techId) {
    var t = HOO.DATA.techById[techId];
    if (!t || emp.techFlags[techId]) return false;
    emp.techFlags[techId] = 1;
    emp.techs[t.cat].push(techId);
    recomputeEmpire(emp);
    return true;
  }

  // best effect of a given type the empire knows (highest level wins)
  function bestTech(emp, type) {
    var best = null;
    for (var f = 0; f < HOO.CONST.FIELDS.length; f++) {
      var list = emp.techs[HOO.CONST.FIELDS[f]];
      for (var i = 0; i < list.length; i++) {
        var t = HOO.DATA.techById[list[i]];
        if (t && t.effect && t.effect.type === type) {
          if (!best || t.level > best.level) best = t;
        }
      }
    }
    return best;
  }

  function allKnown(emp, filterFn) {
    var out = [];
    for (var f = 0; f < HOO.CONST.FIELDS.length; f++) {
      var list = emp.techs[HOO.CONST.FIELDS[f]];
      for (var i = 0; i < list.length; i++) {
        var t = HOO.DATA.techById[list[i]];
        if (t && (!filterFn || filterFn(t))) out.push(t);
      }
    }
    return out;
  }

  // miniaturization: cost halves per 10 levels above min; size -25%/10lv (weapons -50%/10lv)
  function miniCost(emp, tech, baseCost) {
    var lv = techLevel(emp, tech.cat);
    var over = Math.max(0, lv - tech.level);
    return baseCost * Math.pow(0.5, over / 10);
  }
  function miniSize(emp, tech, baseSize) {
    var lv = techLevel(emp, tech.cat);
    var over = Math.max(0, lv - tech.level);
    var rate = (tech.effect && (tech.effect.type === 'weapon')) ? 0.5 : 0.75;
    return baseSize * Math.pow(rate, over / 10);
  }

  // ---------------- derived empire stats ----------------

  function recomputeEmpire(emp) {
    var race = HOO.DATA.raceById[emp.raceId];
    var d = emp.derived = {};

    // fuel range
    var rt = bestTech(emp, 'range');
    d.range = rt ? rt.effect.range : HOO.CONST.BASE_RANGE;

    // scanners
    var sc = bestTech(emp, 'scanner');
    d.scanRange = sc ? sc.effect.range : HOO.CONST.BASE_SCANNER;
    d.shipScanRange = sc ? (sc.effect.shipRange || 0) : 0;
    d.scanShowsDest = !!(sc && sc.effect.showDest);

    // robotics
    var rc = bestTech(emp, 'robotic');
    d.controls = (rc ? rc.effect.controls : HOO.CONST.BASE_CONTROLS) + (race.factoryControlBonus || 0);

    // industry
    var it = bestTech(emp, 'industrial');
    d.factoryCost = it ? it.effect.factoryCost : HOO.CONST.FACTORY_BASE_COST;

    // waste
    var wt = bestTech(emp, 'waste');
    d.wastePct = race.wasteImmune ? 0 : (wt ? wt.effect.pct / 100 : 1);
    var et = bestTech(emp, 'eco');
    d.wastePerBC = et ? et.effect.wastePerBC : 2;

    // planetology worker output: 0.5 BC → 2 BC at planetology level 50
    var pl = techLevel(emp, 'planetology');
    d.workerBC = (0.5 + 1.5 * Math.min(50, pl) / 50) * (race.workerOutput || 1);

    // colonization
    var cz = bestTech(emp, 'colonize');
    d.maxHostility = race.landAnywhere ? 99 : (cz ? cz.effect.hostility : 0);
    d.canAtmos = !!bestTech(emp, 'atmos');
    d.canSoil = !!bestTech(emp, 'soil');
    d.canAdvSoil = !!bestTech(emp, 'advSoil');
    var tf = bestTech(emp, 'terraform');
    d.terraformAdd = tf ? tf.effect.add : 0;
    d.terraformCost = tf ? (tf.effect.costPer || 5) : 5;
    var cl = bestTech(emp, 'cloning');
    d.popCost = cl ? cl.effect.costPerPop : 20;

    // shields
    var ps = bestTech(emp, 'planetShield');
    d.planetShield = ps ? ps.effect.cls : 0;
    var ds = bestTech(emp, 'shield');
    d.deflector = ds ? ds.effect.cls : 0;

    // engines
    var en = bestTech(emp, 'engine');
    d.warp = en ? en.effect.warp : 1;

    // ground combat gear
    var gw = bestTech(emp, 'groundWeapon');
    var gs = bestTech(emp, 'groundShield');
    var bestArmorGc = 0, arm = null;
    allKnown(emp, function (t) { return t.effect.type === 'armor'; }).forEach(function (t) {
      if (!arm || t.level > arm.level) arm = t;
      if ((t.effect.gc || 0) > bestArmorGc) bestArmorGc = t.effect.gc || 0;
    });
    d.groundBonus = (race.groundBonus || 0) + (gw ? gw.effect.bonus : 0) +
      (gs ? gs.effect.bonus : 0) + bestArmorGc;
    d.bestArmor = arm;

    d.hasStargate = !!bestTech(emp, 'stargate');
    d.hasInterdictor = !!bestTech(emp, 'interdictor');
    d.hasCombatTransporters = !!bestTech(emp, 'combatTransporters');
    d.hasHypercomm = !!bestTech(emp, 'hypercomm');
    var ad = bestTech(emp, 'antidote');
    d.antidote = ad ? ad.effect.reduce : 0;

    // security base = computer tech level (as %)
    d.securityBase = techLevel(emp, 'computers');
    return d;
  }

  // ---------------- empire creation ----------------

  function makeEmpire(id, raceId, isPlayer, name) {
    var race = HOO.DATA.raceById[raceId];
    var emp = {
      id: id, raceId: raceId, isPlayer: !!isPlayer, dead: false,
      name: name || race.name,
      leaderName: U.pick(HOO.DATA.LEADER_NAMES[raceId]),
      color: race.color,
      personality: race.personality, objective: race.objective,
      techs: { computers: [], construction: [], forceFields: [], planetology: [], propulsion: [], weapons: [] },
      techFlags: {},
      research: {
        alloc: { computers: 16, construction: 17, forceFields: 16, planetology: 17, propulsion: 17, weapons: 17 },
        locked: {},
        projects: {}   // field -> {techId, invested, done:false}
      },
      reserve: 0, taxRate: 0,
      designs: [null, null, null, null, null, null],
      relations: {},   // empId -> relation record
      spies: {},       // empId -> {count, mission, alloc}
      securityAlloc: 0,
      homeStarId: null,
      shipMaintenance: 0,
      stats: {}
    };

    // vary AI leaders: 65% racial tendency, else random
    if (!isPlayer) {
      if (!U.chance(0.65)) emp.personality = U.pick(Object.keys(HOO.DATA.PERSONALITIES));
      if (!U.chance(0.65)) emp.objective = U.pick(Object.keys(HOO.DATA.OBJECTIVES));
    }

    // starting technology
    var st = HOO.DATA.STARTING_TECHS;
    HOO.CONST.FIELDS.forEach(function (f) {
      (st[f] || []).forEach(function (tid) {
        var t = HOO.DATA.techById[tid];
        if (t) { emp.techFlags[tid] = 1; emp.techs[f].push(tid); }
      });
    });
    recomputeEmpire(emp);
    return emp;
  }

  // relation record between empires
  function makeRelation(baseValue) {
    return {
      contact: false,
      value: baseValue, base: baseValue,
      treaty: 'none',        // none | nonAggression | alliance
      war: false,
      trade: 0, tradePct: -30,
      permanentPenalty: 0,   // broken treaties etc
      embassy: true,
      audienceFatigue: 0,
      warWeary: 0
    };
  }

  // ---------------- new game ----------------

  function newGame(opts) {
    // opts: {size, difficulty, opponents, raceId, leaderName, homeName, seed}
    var seed = opts.seed || ((Math.random() * 0xFFFFFFFF) >>> 0);
    U.seedRng(seed);

    var g = {
      seed: seed,
      year: HOO.CONST.START_YEAR,
      turn: 0,
      size: opts.size, difficulty: opts.difficulty,
      empires: [],
      stars: [],
      nebulas: [],
      fleets: [], transports: [],
      fleetSeq: 1,
      council: { formed: false, lastVote: 0, highMaster: null, finalWar: false },
      guardian: { alive: true, hits: 6000, maxHits: 6000 },
      orionStarId: null,
      pirates: null, monster: null, comet: null,
      notices: [],
      pendingCombats: [],
      eventCooldown: 8,
      gameOver: null
    };

    // choose opponent races
    var others = HOO.DATA.RACES.map(function (r) { return r.id; })
      .filter(function (rid) { return rid !== opts.raceId; });
    var oppIds = U.shuffle(others).slice(0, opts.opponents);

    var player = makeEmpire(0, opts.raceId, true, null);
    if (opts.leaderName) player.leaderName = opts.leaderName;
    g.empires.push(player);
    oppIds.forEach(function (rid, i) { g.empires.push(makeEmpire(i + 1, rid, false, null)); });

    // relations
    g.empires.forEach(function (a) {
      g.empires.forEach(function (b) {
        if (a.id === b.id) return;
        var base = (HOO.DATA.START_RELATIONS[a.raceId] && HOO.DATA.START_RELATIONS[a.raceId][b.raceId]) || 0;
        a.relations[b.id] = makeRelation(base);
      });
    });

    HOO.game = g;
    HOO.Galaxy.generate(g, opts);

    // initial colonies & fleets
    g.empires.forEach(function (emp) {
      var star = g.stars[emp.homeStarId];
      star.planet.colony = HOO.Colony.create(emp.id, star, 50, 30);
      star.explored[emp.id] = true;
      if (opts.homeName && emp.isPlayer) star.name = opts.homeName;

      // initial designs: scout + colony ship (+ fighter on easier settings)
      HOO.ShipDesign.createStarterDesigns(emp);
      var diff = HOO.CONST.DIFFICULTIES[opts.difficulty];
      var scouts = 2, fighters = (diff.aiProd <= 0.8 || emp.isPlayer) ? (opts.difficulty === 'simple' ? 2 : 0) : 0;
      HOO.Fleet.addShips(g, emp.id, emp.homeStarId, 0, scouts);
      HOO.Fleet.addShips(g, emp.id, emp.homeStarId, 1, 1); // colony ship
      if (fighters) HOO.Fleet.addShips(g, emp.id, emp.homeStarId, 2, fighters);

      // initial research projects
      HOO.Research.ensureProjects(emp);
    });

    g.rngState = U.getRngState();
    return g;
  }

  // ---------------- save / load ----------------

  function save(slot) {
    try {
      HOO.game.rngState = U.getRngState();
      var json = JSON.stringify(HOO.game);
      localStorage.setItem('hoo_save_' + slot, json);
      localStorage.setItem('hoo_save_' + slot + '_meta', JSON.stringify({
        year: HOO.game.year,
        race: HOO.game.empires[0].raceId,
        size: HOO.game.size,
        when: Date.now()
      }));
      return true;
    } catch (e) { return false; }
  }

  function load(slot) {
    var json = localStorage.getItem('hoo_save_' + slot);
    if (!json) return false;
    var g = JSON.parse(json);
    HOO.game = g;
    U.setRngState(g.rngState || g.seed);
    g.empires.forEach(recomputeEmpire);
    return true;
  }

  function saveMeta(slot) {
    var m = localStorage.getItem('hoo_save_' + slot + '_meta');
    return m ? JSON.parse(m) : null;
  }

  function relationName(value) {
    var lv = HOO.DATA.RELATION_LEVELS, name = lv[0].name;
    for (var i = 0; i < lv.length; i++) if (value >= lv[i].min) name = lv[i].name;
    return name;
  }

  HOO.State = {
    newGame: newGame, save: save, load: load, saveMeta: saveMeta,
    makeEmpire: makeEmpire, makeRelation: makeRelation,
    knows: knows, grantTech: grantTech, bestTech: bestTech, allKnown: allKnown,
    techLevel: techLevel, miniCost: miniCost, miniSize: miniSize,
    recomputeEmpire: recomputeEmpire, relationName: relationName
  };
})();
