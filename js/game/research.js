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

  // next unknown techs in a field, by level (choice list)
  function choices(emp, field) {
    var race = HOO.DATA.raceById[emp.raceId];
    var n = race.researchBonus ? 3 : 2; // Rats see more of the tree
    var all = HOO.DATA.TECHS[field];
    var out = [];
    for (var i = 0; i < all.length && out.length < n; i++) {
      if (!emp.techFlags[all[i].id]) out.push(all[i]);
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
    var race = HOO.DATA.raceById[emp.raceId];
    if (race.researchBonus) points *= (1 + race.researchBonus);
    var discoveries = [];
    var alloc = emp.research.alloc;
    var totalAlloc = 0;
    HOO.CONST.FIELDS.forEach(function (f) { totalAlloc += alloc[f] || 0; });
    if (totalAlloc <= 0) return discoveries;

    HOO.CONST.FIELDS.forEach(function (f) {
      var pr = emp.research.projects[f];
      if (!pr) return;
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
          HOO.State.grantTech(emp, tech.id);
          discoveries.push({ empire: emp, tech: tech });
          pr.done = true;
        }
      }
    });

    if (discoveries.length) ensureProjects(emp);
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
    ensureProjects: ensureProjects, processResearch: processResearch, progress: progress
  };
})();
