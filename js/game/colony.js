/* Hamster of Orion — colony economy (manual: Planet Production, Growing Your Empire) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  var MISSILE_BASE_COST = 120;
  var BASE_UPGRADE_COST = 25;   // per base when new missile tech arrives
  var STARGATE_COST = 2000;

  function create(empId, star, pop, factories) {
    return {
      empire: empId, pop: pop, factories: factories || 0,
      controls: HOO.CONST.BASE_CONTROLS,     // robotic level the factories are fitted for
      bases: 0, baseMissileLevel: 0, shield: 0,
      alloc: { ship: 0, def: 0, ind: 60, eco: 20, tech: 20 },
      locks: {},
      buildDesign: 0, shipProgress: 0, baseProgress: 0, shieldProgress: 0,
      upgradeProgress: 0, stargate: false, stargateProgress: 0, buildingStargate: false,
      reloc: null, transported: 0,
      inRebellion: false, rebels: 0,
      // event-progress fields (plague/plagueProgress/plagueNeed, novaThreat/
      // novaProgress/novaNeed/novaYears) are attached by events_run.js when
      // the corresponding event fires
      quarantine: false,
      lastGrowth: 0, lastProd: 0, ecoStatus: ''
    };
  }

  function star(colony) {
    var g = HOO.game;
    for (var i = 0; i < g.stars.length; i++) {
      var s = g.stars[i];
      if (s.planet && s.planet.colony === colony) return s;
    }
    return null;
  }

  function colonies(g, empId) {
    var out = [];
    g.stars.forEach(function (s) {
      if (s.planet && s.planet.colony && s.planet.colony.empire === empId) out.push({ star: s, colony: s.planet.colony });
    });
    return out;
  }

  function maxPop(emp, starObj) {
    var p = starObj.planet;
    var mp = p.size - Math.floor(p.waste);
    return Math.max(10, mp);
  }

  function envGrowthMult(emp, starObj) {
    var race = HOO.DATA.raceById[emp.raceId];
    var p = starObj.planet;
    var def = HOO.CONST.PLANET_TYPES[p.type];
    var m = 1;
    if (def.hostility > 0) m *= 0.5;
    var sp = HOO.CONST.SPECIALS[p.special];
    if (!(race.noFertileBenefit)) m *= (sp.growth || 1);
    if (p.climateShift) m *= 1.5;
    if (race.popGrowthBonus) m *= (1 + race.popGrowthBonus);
    if (race.growthHalved) m *= 0.5;
    return m;
  }

  // raw production before empire-level deductions
  function rawProduction(emp, starObj) {
    var c = starObj.planet.colony;
    var d = emp.derived;
    var working = Math.min(c.factories, c.pop * Math.min(d.controls, c.controls));
    var bc = c.pop * d.workerBC + working;
    if (c.inRebellion) bc = 0;
    return bc;
  }

  function mineralMult(starObj) {
    return HOO.CONST.SPECIALS[starObj.planet.special].prodMult || 1;
  }

  function researchMult(starObj) {
    return HOO.CONST.SPECIALS[starObj.planet.special].research || 1;
  }

  // cost of one factory at a robotic-control level
  function factoryCostAt(emp, controlLevel) {
    var base = emp.derived.factoryCost;
    return base * (1 + 0.5 * Math.max(0, controlLevel - HOO.CONST.BASE_CONTROLS));
  }

  // ---- empire economy: totals, maintenance, per-colony spendable ----
  function empireEconomy(g, emp) {
    var cols = colonies(g, emp.id);
    var totalRaw = 0;
    cols.forEach(function (e) { totalRaw += rawProduction(emp, e.star); });

    // trade income
    var trade = 0;
    g.empires.forEach(function (other) {
      if (other.id === emp.id || other.dead) return;
      var rel = emp.relations[other.id];
      if (rel && rel.trade > 0) {
        var race = HOO.DATA.raceById[emp.raceId];
        var pct = Math.max(-30, Math.min(100, rel.tradePct)) / 100;
        var inc = rel.trade * pct;
        if (inc > 0 && race.tradeBonus) inc *= (1 + race.tradeBonus);
        if (g.pirates && g.pirates.victim === emp.id) inc *= 0.4;
        trade += inc;
      }
    });

    // maintenance
    var shipMaint = 0;
    g.fleets.forEach(function (f) {
      if (f.empire !== emp.id) return;
      f.ships.forEach(function (n, slot) {
        var dsg = emp.designs[slot];
        if (dsg && n > 0) shipMaint += 0.02 * dsg.cost * n;
      });
    });
    var baseMaint = 0, gateMaint = 0;
    cols.forEach(function (e) {
      baseMaint += 0.02 * MISSILE_BASE_COST * e.colony.bases;
      if (e.colony.stargate) gateMaint += 100;
    });

    // espionage & security
    var spyCost = 0;
    Object.keys(emp.spies).forEach(function (k) {
      spyCost += (emp.spies[k].alloc || 0) / 100 * totalRaw;
    });
    var secCost = (emp.securityAlloc || 0) / 100 * totalRaw;

    var expenses = shipMaint + baseMaint + gateMaint + spyCost + secCost;
    var total = totalRaw + trade;
    var actual = Math.max(0, total - expenses);
    var ratio = totalRaw > 0 ? actual / totalRaw : 0;

    emp.economy = {
      totalRaw: totalRaw, trade: trade, shipMaint: shipMaint, baseMaint: baseMaint + gateMaint,
      spyCost: spyCost, secCost: secCost, total: total, actual: actual, ratio: ratio
    };
    emp.shipMaintenance = shipMaint;
    return emp.economy;
  }

  // ---- per-colony turn processing; returns {research, notices:[...]} ----
  function processColony(g, emp, starObj) {
    var c = starObj.planet.colony;
    var p = starObj.planet;
    var d = emp.derived;
    var race = HOO.DATA.raceById[emp.raceId];
    var notices = [];
    var research = 0;

    var raw = rawProduction(emp, starObj);
    var spend = raw * (emp.economy ? emp.economy.ratio : 1);
    if (!emp.isPlayer && c.aiBonus) spend *= c.aiBonus; // difficulty production bonus

    // project this year's industrial waste (added to the planet in the ecology phase,
    // so mid-turn max population is not distorted)
    var working = Math.min(c.factories, c.pop * Math.min(d.controls, c.controls));
    var newWaste = race.wasteImmune ? 0 : working * d.wastePct;

    // reserve tax (2 BC collected -> 1 BC to reserve)
    if (emp.taxRate > 0) {
      var taxed = spend * emp.taxRate / 100;
      emp.reserve += taxed / 2;
      spend -= taxed;
    }
    // reserve transfer earmarked to this colony (limited to raw production/year).
    // The fund is drawn down after the eco auto-raise below, so ecoMinPct's
    // spendEstimate sees the same transfer money this year actually spends.
    var transferUse = 0;
    if (c.transferFund && c.transferFund > 0) {
      transferUse = Math.min(c.transferFund, raw);
      spend += transferUse;
    }
    c.lastProd = spend;

    // manual (Relocate): new ships may only be routed to one of our own
    // colonies — cancel the order if the destination has since been lost
    if (c.reloc !== null && c.reloc !== undefined) {
      var rDest = g.stars[c.reloc];
      var rCol = rDest && rDest.planet ? rDest.planet.colony : null;
      if (!rCol || rCol.empire !== emp.id) {
        c.reloc = null;
        notices.push({ type: 'info', text: 'Ship relocation from ' + starObj.name + ' cancelled — the destination is no longer one of our colonies. New ships will stay in orbit.' });
      }
    }

    if (c.inRebellion) { c.ecoStatus = 'REBELLION'; return { research: 0, notices: notices }; }

    // manual p.14: the Ecology allocation is automatically raised to the minimum
    // needed to keep the planet clean (unless the player has locked the bar).
    // Uses the same shared formula the UI displays, so bar and engine always agree.
    if (spend > 0 && !(c.locks && c.locks.eco)) {
      var needPct = ecoMinPct(emp, starObj);
      if (needPct > c.alloc.eco) raiseEco(c, needPct);
    }
    if (transferUse > 0) {
      c.transferFund -= transferUse;
      if (c.transferFund < 0.5) c.transferFund = 0;
    }

    var mm = mineralMult(starObj);
    var a = c.alloc;
    var shipBC = spend * a.ship / 100 * mm;
    var defBC = spend * a.def / 100 * mm;
    var indBC = spend * a.ind / 100 * mm;
    var ecoBC = spend * a.eco / 100;
    var techBC = spend * a.tech / 100;

    // ---------- SHIP ----------
    if (shipBC > 0) {
      if (c.buildingStargate && d.hasStargate && !c.stargate) {
        c.stargateProgress += shipBC;
        if (c.stargateProgress >= STARGATE_COST) {
          c.stargate = true; c.buildingStargate = false; c.stargateProgress = 0;
          notices.push({ type: 'built', text: starObj.name + ' has completed a star gate.' });
        }
      } else {
        var dsg = emp.designs[c.buildDesign];
        if (dsg) {
          c.shipProgress += shipBC;
          var built = Math.floor(c.shipProgress / dsg.cost);
          if (built > 0) {
            c.shipProgress -= built * dsg.cost;
            var destStar = (c.reloc !== null && c.reloc !== undefined) ? c.reloc : starObj.id;
            if (destStar !== starObj.id) {
              HOO.Fleet.sendNewShips(g, emp.id, starObj.id, destStar, c.buildDesign, built);
            } else {
              HOO.Fleet.addShips(g, emp.id, starObj.id, c.buildDesign, built);
            }
            c.lastBuilt = { design: c.buildDesign, count: built };
          }
        }
      }
    }

    // ---------- DEFENSE: upgrade bases, then shield, then new bases ----------
    if (defBC > 0) {
      var bestMissileLv = bestMissileLevel(emp);
      // upgrade existing bases to newest missiles
      if (c.bases > 0 && c.baseMissileLevel < bestMissileLv) {
        var upCost = BASE_UPGRADE_COST * c.bases * (bestMissileLv - c.baseMissileLevel);
        c.upgradeProgress += defBC;
        defBC = 0;
        if (c.upgradeProgress >= upCost) {
          defBC = c.upgradeProgress - upCost;
          c.upgradeProgress = 0;
          c.baseMissileLevel = bestMissileLv;
        }
      }
      // planetary shield
      if (defBC > 0 && d.planetShield > c.shield && !starObj.inNebula) {
        var shCost = 100 * d.planetShield;
        c.shieldProgress += defBC;
        defBC = 0;
        if (c.shieldProgress >= shCost) {
          defBC = c.shieldProgress - shCost;
          c.shieldProgress = 0;
          c.shield = d.planetShield;
          notices.push({ type: 'built', text: 'A Class ' + U.roman(c.shield) + ' planetary shield now protects ' + starObj.name + '.' });
        }
      }
      // new missile bases
      if (defBC > 0) {
        c.baseProgress += defBC;
        var nb = Math.floor(c.baseProgress / MISSILE_BASE_COST);
        if (nb > 0) {
          c.baseProgress -= nb * MISSILE_BASE_COST;
          c.bases += nb;
          c.baseMissileLevel = bestMissileLevel(emp);
        }
      }
    }

    // ---------- INDUSTRY ----------
    if (indBC > 0) {
      // refit factories to current robotic controls first
      if (c.controls < d.controls && c.factories > 0) {
        var refitCost = (factoryCostAt(emp, d.controls) - factoryCostAt(emp, c.controls)) * c.factories;
        c.refitProgress = (c.refitProgress || 0) + indBC;
        indBC = 0;
        if (c.refitProgress >= refitCost) {
          indBC = c.refitProgress - refitCost;
          c.refitProgress = 0;
          c.controls = d.controls;
        }
      } else if (c.controls < d.controls) {
        c.controls = d.controls; // no factories built yet — nothing to refit
      }
      if (indBC > 0) {
        var mp = maxPop(emp, starObj);
        var maxFact = mp * Math.min(d.controls, c.controls);
        if (c.factories < maxFact) {
          var fCost = factoryCostAt(emp, c.controls);
          var nf = indBC / fCost;
          c.factories = Math.min(maxFact, c.factories + nf);
        } else {
          emp.reserve += indBC / 2; // excess industry -> reserve (RESERV)
          c.ecoStatus = 'RESERVE';
        }
      }
    }

    // ---------- ECOLOGY ---------- (the year's waste lands now, then gets cleaned)
    p.waste = Math.min(p.size * 0.75, p.waste + newWaste);
    c.ecoStatus = '';
    if (ecoBC > 0 || p.waste > 0) {
      // 1) clean waste
      var cleanCost = p.waste / d.wastePerBC;
      var cleanSpend = Math.min(ecoBC, cleanCost);
      p.waste -= cleanSpend * d.wastePerBC;
      if (p.waste < 0.5) p.waste = 0;
      ecoBC -= cleanSpend;
      if (p.waste > 0 && !race.wasteImmune) c.ecoStatus = 'WASTE';
      else c.ecoStatus = 'CLEAN';

      var def = HOO.CONST.PLANET_TYPES[p.type];
      // 2) atmospheric terraforming: hostile -> minimal (standard)
      if (ecoBC > 0 && def.hostility > 0 && d.canAtmos && !p.envConverted) {
        c.atmosProgress = (c.atmosProgress || 0) + ecoBC; ecoBC = 0;
        c.ecoStatus = 'ATMOS';
        if (c.atmosProgress >= 200) {
          ecoBC = c.atmosProgress - 200; c.atmosProgress = 0;
          // manual (Planetology): only the environment changes; planet size
          // is untouched — further growth needs the Terraforming +N techs
          p.type = 'minimal'; p.envConverted = true;
          notices.push({ type: 'eco', text: 'Atmospheric conversion complete: ' + starObj.name + ' now sustains open-air life.' });
        }
      }
      // 3) soil enrichment
      var defNow = HOO.CONST.PLANET_TYPES[p.type];
      if (ecoBC > 0 && defNow.hostility === 0 && d.canSoil && p.special === 'none') {
        c.soilProgress = (c.soilProgress || 0) + ecoBC; ecoBC = 0;
        c.ecoStatus = 'SOIL';
        if (c.soilProgress >= 150) {
          ecoBC = c.soilProgress - 150; c.soilProgress = 0;
          p.special = 'fertile';
          applySoilBonus(p, 1.25);
          notices.push({ type: 'eco', text: 'Soil enrichment complete: ' + starObj.name + ' is now Fertile.' });
        }
      }
      if (ecoBC > 0 && defNow.hostility === 0 && d.canAdvSoil && (p.special === 'none' || p.special === 'fertile')) {
        c.gaiaProgress = (c.gaiaProgress || 0) + ecoBC; ecoBC = 0;
        c.ecoStatus = 'SOIL';
        if (c.gaiaProgress >= 300) {
          ecoBC = c.gaiaProgress - 300; c.gaiaProgress = 0;
          p.special = 'gaia';
          applySoilBonus(p, 1.5);
          notices.push({ type: 'eco', text: starObj.name + ' has been remade as a Gaia world.' });
        }
      }
      // 4) terraform planet size
      if (ecoBC > 0 && d.terraformAdd > p.terraformed) {
        var canAdd = d.terraformAdd - p.terraformed;
        var addUnits = Math.min(canAdd, ecoBC / d.terraformCost);
        p.terraformed += addUnits;
        p.size = p.baseSize + Math.floor(p.terraformed);
        ecoBC -= addUnits * d.terraformCost;
        if (addUnits > 0.2) c.ecoStatus = 'TERRAFORM';
      }
      // 5) accelerated growth
      if (ecoBC > 0) {
        var mp2 = maxPop(emp, starObj);
        var boost = Math.min(ecoBC / d.popCost, c.pop / 4, Math.max(0, mp2 - c.pop));
        c.boostPop = boost;
        ecoBC -= boost * d.popCost;
        if (boost >= 0.5) c.ecoStatus = '+' + Math.round(boost) + ' POP';
      } else c.boostPop = 0;
      // 6) nothing left to improve: surplus flows to the reserve (like industry)
      if (ecoBC > 0.5) {
        emp.reserve += ecoBC / 2;
        c.ecoStatus = 'RESERVE';
      }
    }

    // ---------- TECH ----------
    if (techBC > 0 && !c.quarantine && !c.novaThreat) {
      research = techBC * researchMult(starObj);
    }

    return { research: research, notices: notices };
  }

  // raise the eco allocation to needPct, drawing from unlocked bars proportionally
  function raiseEco(c, needPct) {
    var keys = ['ship', 'def', 'ind', 'tech'];
    var locks = c.locks || {};
    var lockedSum = 0;
    keys.forEach(function (k) { if (locks[k]) lockedSum += c.alloc[k]; });
    needPct = Math.min(needPct, 100 - lockedSum);
    if (needPct <= c.alloc.eco) return;
    var free = keys.filter(function (k) { return !locks[k]; });
    var freeSum = 0;
    free.forEach(function (k) { freeSum += c.alloc[k]; });
    var take = Math.min(needPct - c.alloc.eco, freeSum);
    c.alloc.eco += take;
    if (freeSum > 0) {
      free.forEach(function (k) { c.alloc[k] = Math.max(0, c.alloc[k] - take * c.alloc[k] / freeSum); });
    }
  }

  // manual (Planetology): Soil Enrichment raises max population 25%, Advanced
  // Soil Enrichment 50%, both relative to the un-enriched planet. p.soilBonus
  // records the multiplier already applied so fertile -> gaia only adds the
  // difference; scaling baseSize keeps terraforming and bombardment composable.
  function applySoilBonus(p, mult) {
    var prev = p.soilBonus || 1;
    if (mult <= prev) return;
    p.baseSize = Math.round(p.baseSize * mult / prev);
    p.soilBonus = mult;
    p.size = p.baseSize + Math.floor(p.terraformed);
  }

  // BC needed this year to fully clean the planet (assumes waste already accrued)
  function ecoCleanNeed(emp, starObj) {
    return starObj.planet.waste / emp.derived.wastePerBC;
  }

  // the single source of truth for a colony's spendable BC estimate (mirrors
  // processColony: economy ratio, AI difficulty bonus, reserve tax, and the
  // year's reserve-transfer draw)
  function spendEstimate(emp, starObj) {
    var c = starObj.planet.colony;
    var raw = rawProduction(emp, starObj);
    var spend = raw * (emp.economy ? emp.economy.ratio : 1);
    if (!emp.isPlayer && c && c.aiBonus) spend *= c.aiBonus;
    if (emp.taxRate > 0) spend -= spend * emp.taxRate / 100;
    if (c && c.transferFund && c.transferFund > 0) spend += Math.min(c.transferFund, raw);
    return Math.max(0, spend);
  }

  // the single source of truth for the minimum eco % that keeps a planet clean.
  // Used by the engine's auto-raise, the panel display, presets, and the AI.
  function ecoMinPct(emp, starObj) {
    var c = starObj.planet.colony;
    var p = starObj.planet;
    var d = emp.derived;
    var race = HOO.DATA.raceById[emp.raceId];
    if (race.wasteImmune || !c) return 0;
    var working = Math.min(c.factories, c.pop * Math.min(d.controls, c.controls));
    var projected = Math.min(p.size * 0.75, p.waste + working * d.wastePct);
    var spend = spendEstimate(emp, starObj);
    if (spend <= 0 || projected <= 0) return 0;
    return Math.min(100, Math.ceil((projected / d.wastePerBC) / spend * 100));
  }

  // legacy alias
  function ecoCleanPct(emp, starObj) { return ecoMinPct(emp, starObj); }

  function bestMissileLevel(emp) {
    var lv = 0;
    HOO.State.allKnown(emp, function (t) {
      return t.effect.type === 'weapon' && (t.effect.wclass === 'missile');
    }).forEach(function (t) { if (t.level > lv) lv = t.level; });
    return lv;
  }

  // population growth phase (after spending)
  function growPopulation(g, emp, starObj) {
    var c = starObj.planet.colony;
    var mp = maxPop(emp, starObj);
    var mult = envGrowthMult(emp, starObj);
    // manual (Growing Your Empire): ~10% logistic base rate, tapering as the
    // planet fills, before race/environment modifiers
    var growth = 0.1 * c.pop * (1 - c.pop / mp) * mult;
    if (c.pop > mp) growth = -(c.pop - mp) * 0.1 - 0.2;
    growth += (c.boostPop || 0);
    c.boostPop = 0;
    if (c.plague) growth = Math.min(growth, 0) - c.pop * 0.05;
    c.pop = Math.max(0, c.pop + growth);
    c.lastGrowth = growth;
    if (c.pop < 0.5) {
      // colony dies
      starObj.planet.colony = null;
      return { died: true };
    }
    return { died: false };
  }

  HOO.Colony = {
    create: create, colonies: colonies, maxPop: maxPop, rawProduction: rawProduction,
    empireEconomy: empireEconomy, processColony: processColony, growPopulation: growPopulation,
    ecoCleanNeed: ecoCleanNeed, ecoCleanPct: ecoCleanPct, ecoMinPct: ecoMinPct, spendEstimate: spendEstimate,
    factoryCostAt: factoryCostAt, mineralMult: mineralMult, researchMult: researchMult,
    envGrowthMult: envGrowthMult, bestMissileLevel: bestMissileLevel,
    MISSILE_BASE_COST: MISSILE_BASE_COST, STARGATE_COST: STARGATE_COST, star: star
  };
})();
