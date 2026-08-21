/* Hamster of Orion — research (manual: The Technology Screen / Technology) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  var COST_FACTOR = 3.5;

  function baseCost(emp, tech) {
    var g = HOO.game;
    var diff = HOO.CONST.DIFFICULTIES[g.difficulty].researchFactor;
    var race = HOO.DATA.raceById[emp.raceId];
    var mult = (race.researchCosts && race.researchCosts[tech.cat]) || 1;
    return Math.max(4, Math.round(tech.level * tech.level * COST_FACTOR * diff * mult));
  }

  // ---- per-game tech tree subset (manual: Technology) ----
  // Each empire receives only a random portion of every field's tree at game
  // start; missing techs can only be obtained via espionage, trade, or
  // conquest. Rats (the Psilon analog) receive a larger selection.
  // Guarantee: at least one tech survives in every 5-level tier of a field,
  // so no field ever dead-ends purely from a bad roll.
  var TREE_CHANCE = 0.5;
  var TREE_CHANCE_WIDE = 0.75;

  function generateTree(emp) {
    var race = HOO.DATA.raceById[emp.raceId];
    var p = race.extraTechChoices ? TREE_CHANCE_WIDE : TREE_CHANCE;
    var tree = {};
    HOO.CONST.FIELDS.forEach(function (f) {
      var tiers = {}; // 5-level band -> techs in it
      HOO.DATA.TECHS[f].forEach(function (t) {
        var k = Math.ceil(t.level / 5);
        (tiers[k] = tiers[k] || []).push(t);
        // starting/known techs are always in-tree
        if (emp.techFlags[t.id] || U.chance(p)) tree[t.id] = 1;
      });
      Object.keys(tiers).forEach(function (k) {
        var got = tiers[k].some(function (t) { return tree[t.id]; });
        if (!got) tree[U.pick(tiers[k]).id] = 1; // tier rolled dry — keep one
      });
    });
    emp.research.tree = tree;
  }

  // can this empire's own scientists ever reach the tech this game?
  // Known techs always count; empires without a tree (legacy saves) see everything.
  function inTree(emp, techId) {
    if (emp.techFlags[techId]) return true;
    var tree = emp.research && emp.research.tree;
    return tree ? !!tree[techId] : true;
  }

  // next unknown in-tree techs in a field, by level (choice list)
  function choices(emp, field) {
    var race = HOO.DATA.raceById[emp.raceId];
    var n = 2 + (race.extraTechChoices || 0); // Rats pick from a wider window
    var all = HOO.DATA.TECHS[field];
    var out = [];
    for (var i = 0; i < all.length && out.length < n; i++) {
      if (!emp.techFlags[all[i].id] && inTree(emp, all[i].id)) out.push(all[i]);
    }
    return out;
  }

  function startProject(emp, field, techId) {
    emp.research.projects[field] = { techId: techId, invested: 0, done: false };
  }

  function ensureProjects(emp) {
    HOO.CONST.FIELDS.forEach(function (f) {
      var pr = emp.research.projects[f];
      if (!pr || emp.techFlags[pr.techId]) {
        var ch = choices(emp, f);
        if (ch.length) startProject(emp, f, ch[0].id);
        else emp.research.projects[f] = null; // field exhausted
      }
    });
  }

  // invest a year's research points; returns [{empire, tech}] discoveries
  function processResearch(g, emp, points) {
    var discoveries = [];
    var alloc = emp.research.alloc;
    var totalAlloc = 0;
    // exhausted fields (null project) don't count — their slider share is
    // redistributed to live fields instead of evaporating
    HOO.CONST.FIELDS.forEach(function (f) {
      if (emp.research.projects[f]) totalAlloc += alloc[f] || 0;
    });
    if (totalAlloc <= 0) return discoveries;

    var stale = false;
    HOO.CONST.FIELDS.forEach(function (f) {
      var pr = emp.research.projects[f];
      if (!pr) return;
      if (emp.techFlags[pr.techId]) { stale = true; return; } // acquired elsewhere — re-pick below
      var tech = HOO.DATA.techById[pr.techId];
      var add = points * (alloc[f] || 0) / totalAlloc;

      if (add <= 0) {
        // shelved research decays 10% per year
        pr.invested *= 0.9;
        return;
      }
      // interest: 15% of invested, capped at this year's addition
      var interest = Math.min(pr.invested * 0.15, add);
      pr.invested += add + interest;

      var cost = baseCost(emp, tech);
      if (pr.invested >= cost) {
        var chancePct = Math.min(90, ((pr.invested - cost) / cost) * 50);
        if (U.roll100() <= chancePct) {
          pr.done = true;
          if (HOO.State.grantTech(emp, tech.id)) {
            discoveries.push({ empire: emp, tech: tech });
          }
        }
      }
    });

    if (discoveries.length || stale) ensureProjects(emp);
    return discoveries;
  }

  // progress info for UI
  function progress(emp, field) {
    var pr = emp.research.projects[field];
    if (!pr) return null;
    var tech = HOO.DATA.techById[pr.techId];
    var cost = baseCost(emp, tech);
    return {
      tech: tech, invested: pr.invested, cost: cost,
      pctToBase: Math.min(1, pr.invested / cost),
      discoveryChance: pr.invested >= cost ? Math.min(90, ((pr.invested - cost) / cost) * 50) : 0
    };
  }

  HOO.Research = {
    baseCost: baseCost, choices: choices, startProject: startProject,
    generateTree: generateTree, inTree: inTree,
    ensureProjects: ensureProjects, processResearch: processResearch, progress: progress
  };
})();
