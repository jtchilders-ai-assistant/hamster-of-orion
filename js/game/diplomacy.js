/* Hamster of Orion — diplomacy (manual: Diplomatic Relations, Trade and Tribute) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  // adjust how `who` feels about `about`
  function adjust(g, whoId, aboutId, delta, hostile) {
    var who = g.empires[whoId], about = g.empires[aboutId];
    if (!who || !about || who.dead || about.dead) return;
    var rel = who.relations[aboutId];
    if (!rel) return;
    var pers = HOO.DATA.PERSONALITIES[who.personality];
    if (delta > 0) {
      var race = HOO.DATA.raceById[about.raceId];
      if (race.diplomacyDouble) delta *= 2;         // Hamsters double positive actions
      if (pers.hostileDouble) delta *= 0.5;         // xenophobes discount goodwill
      delta *= (pers.tributeEffect || 1);
    } else if (hostile) {
      if (pers.hostileDouble) delta *= 2;           // xenophobes double hostility
      if (pers.grudge && delta < 0) delta *= 1.5;   // honourable leaders react strongly to wrongs
    }
    rel.value = U.clamp(rel.value + delta, -100, 100);
  }

  function declareWar(g, whoId, onId) {
    var who = g.empires[whoId], on = g.empires[onId];
    if (!who || !on) return;
    [who.relations[onId], on.relations[whoId]].forEach(function (rel) {
      if (!rel) return;
      rel.war = true;
      rel.embassy = false;
      rel.warWeary = 0;
      if (rel.treaty !== 'none') { rel.treaty = 'none'; rel.permanentPenalty -= 5; }
      rel.trade = 0; rel.tradePct = -30;
      rel.value = Math.min(rel.value, -60);
    });
    if (g && g.notices && (who.isPlayer || on.isPlayer)) {
      var a = HOO.DATA.raceById[who.raceId].name, b = HOO.DATA.raceById[on.raceId].name;
      g.notices.push({ type: 'war', text: 'The ' + a + ' have declared war on the ' + b + '!' });
    }
  }

  function makePeace(g, aId, bId) {
    var a = g.empires[aId], b = g.empires[bId];
    [a.relations[bId], b.relations[aId]].forEach(function (rel) {
      rel.war = false; rel.embassy = true;
      rel.value = Math.max(rel.value, -20);
    });
  }

  // yearly drift toward base value; war weariness; embassy return
  function yearlyDrift(g) {
    g.empires.forEach(function (emp) {
      if (emp.dead) return;
      g.empires.forEach(function (other) {
        if (other.dead || other.id === emp.id) return;
        var rel = emp.relations[other.id];
        if (!rel || !rel.contact) return;
        var target = rel.base + rel.permanentPenalty;
        var drift = rel.value > target ? -1 : (rel.value < target ? 1.5 : 0);
        rel.value = U.clamp(rel.value + drift, -100, 100);
        // treaties slowly build goodwill while honoured
        if (rel.treaty === 'nonAggression') rel.value = U.clamp(rel.value + 0.5, -100, 100);
        if (rel.treaty === 'alliance') rel.value = U.clamp(rel.value + 1, -100, 100);
        if (rel.trade > 0) {
          rel.tradePct = Math.min(100, rel.tradePct + U.rint(0, 5));
          rel.value = U.clamp(rel.value + 0.4, -100, 100);
        }
        if (rel.war) {
          rel.warWeary++;
          if (rel.warWeary > 8 && !rel.embassy) rel.embassy = true;
        }
        if (rel.audienceFatigue > 0) rel.audienceFatigue--;
      });
    });
  }

  // contact check: colonies within fuel range of each other's scanners
  function updateContacts(g) {
    var newContacts = [];
    g.empires.forEach(function (a) {
      if (a.dead) return;
      g.empires.forEach(function (b) {
        if (b.dead || b.id <= a.id) return;
        var relA = a.relations[b.id], relB = b.relations[a.id];
        if (relA.contact) return;
        // contact when either can reach the other's colony within range+scan
        var made = false;
        HOO.Colony.colonies(g, a.id).forEach(function (ca) {
          HOO.Colony.colonies(g, b.id).forEach(function (cb) {
            var d = U.dist(ca.star.x, ca.star.y, cb.star.x, cb.star.y) / HOO.Galaxy.PARSEC;
            if (d <= Math.max(a.derived.range, b.derived.range) + 2) made = true;
          });
        });
        if (made) {
          relA.contact = relB.contact = true;
          newContacts.push([a, b]);
        }
      });
    });
    return newContacts;
  }

  // ---------- trade ----------
  function maxTrade(g, a, b) {
    var pa = a.economy ? a.economy.totalRaw : 0;
    var pb = b.economy ? b.economy.totalRaw : 0;
    return Math.floor(Math.min(pa, pb) * 0.25);
  }

  function formTrade(g, aId, bId, amount) {
    var a = g.empires[aId], b = g.empires[bId];
    [a.relations[bId], b.relations[aId]].forEach(function (rel) {
      if (rel.trade > 0) rel.tradePct = Math.round((rel.tradePct + (-30)) / 2);
      else rel.tradePct = -30;
      rel.trade = amount;
    });
  }

  function breakTradeAndTreaty(g, aId, bId, what) {
    var a = g.empires[aId], b = g.empires[bId];
    var relA = a.relations[bId], relB = b.relations[aId];
    if (what === 'trade' || what === 'all') {
      relA.trade = relB.trade = 0;
      relA.tradePct = relB.tradePct = -30;
    }
    if (what === 'treaty' || what === 'all') {
      if (relA.treaty !== 'none') {
        relA.treaty = relB.treaty = 'none';
        relB.permanentPenalty -= 10;
        adjust(g, bId, aId, -15, true);
      }
    }
  }

  // ---------- tribute ----------
  function offerTribute(g, fromId, toId, bc) {
    var from = g.empires[fromId], to = g.empires[toId];
    bc = Math.min(bc, from.reserve);
    if (bc <= 0) return false;
    from.reserve -= bc;
    to.reserve += bc;
    var toProd = to.economy ? Math.max(50, to.economy.totalRaw) : 100;
    var shift = (bc / (toProd * 0.10)) * 5; // 10% of rival production = half a level (~5 pts)
    adjust(g, toId, fromId, shift, false);
    return true;
  }

  function tributeTech(g, fromId, toId, techId) {
    var from = g.empires[fromId], to = g.empires[toId];
    if (!from.techFlags[techId] || to.techFlags[techId]) return false;
    HOO.State.grantTech(to, techId);
    var t = HOO.DATA.techById[techId];
    adjust(g, toId, fromId, 8 + t.level / 4, false);
    return true;
  }

  // ---------- AI evaluation of proposals (returns true = accept) ----------
  function evalProposal(g, aiId, byId, kind, payload) {
    var ai = g.empires[aiId];
    var rel = ai.relations[byId];
    var pers = HOO.DATA.PERSONALITIES[ai.personality];
    if (rel.audienceFatigue > 3) return { accept: false, reason: 'fatigue' };
    rel.audienceFatigue++;

    var powerUs = HOO.Turn.powerOf(g, ai);
    var powerThem = HOO.Turn.powerOf(g, g.empires[byId]);
    var ratio = powerThem / Math.max(1, powerUs);
    var race = HOO.DATA.raceById[g.empires[byId].raceId];
    var v = rel.value + (race.councilBonus || 0);

    switch (kind) {
      case 'nonAggression':
        return { accept: v > -10 && !rel.war };
      case 'alliance':
        return { accept: v > 45 && !rel.war && ratio > 0.5 };
      case 'peace': {
        var will = pers.peaceWill + (rel.warWeary > 6 ? 0.3 : 0) + (ratio > 1.5 ? 0.3 : 0) - (ratio < 0.6 ? 0.4 : 0);
        return { accept: rel.war && U.rand() < will };
      }
      case 'trade':
        return { accept: v > -5 && !rel.war && maxTrade(g, ai, g.empires[byId]) >= (payload && payload.amount || 25) };
      case 'threat': {
        if (ratio > 2 && v > -40) {
          var trib = Math.min(ai.reserve, Math.round((ai.economy ? ai.economy.totalRaw : 50) * 0.1));
          ai.reserve -= trib;
          g.empires[byId].reserve += trib;
          adjust(g, aiId, byId, -10, true);
          return { accept: true, tribute: trib };
        }
        adjust(g, aiId, byId, -12, true);
        if (ratio < 0.8 && v < pers.warThreshold / 2) declareWar(g, aiId, byId);
        return { accept: false };
      }
      case 'breakAllianceWith': {
        var target = payload.target;
        var relT = ai.relations[target];
        if (v > 40 && relT && relT.value < 0) {
          breakTradeAndTreaty(g, aiId, target, 'treaty');
          return { accept: true };
        }
        return { accept: false };
      }
      case 'declareWarOn': {
        var relW = ai.relations[payload.target];
        if (v > 60 && relW && relW.value < -30) {
          declareWar(g, aiId, payload.target);
          return { accept: true };
        }
        return { accept: false };
      }
    }
    return { accept: false };
  }

  // techs an AI will offer/want in exchange
  function tradableTechs(from, to) {
    var out = [];
    HOO.CONST.FIELDS.forEach(function (f) {
      from.techs[f].forEach(function (tid) {
        if (!to.techFlags[tid]) {
          var t = HOO.DATA.techById[tid];
          if (t.level <= HOO.State.techLevel(from, f) - 3) out.push(t); // won't trade newest toys
        }
      });
    });
    return out.sort(function (a, b) { return a.level - b.level; });
  }

  function exchangeTech(g, aId, bId, giveId, getId) {
    var a = g.empires[aId], b = g.empires[bId];
    if (!a.techFlags[giveId] || !b.techFlags[getId]) return false;
    HOO.State.grantTech(b, giveId);
    HOO.State.grantTech(a, getId);
    adjust(g, bId, aId, 4, false);
    adjust(g, aId, bId, 4, false);
    return true;
  }

  HOO.Diplomacy = {
    adjust: adjust, declareWar: declareWar, makePeace: makePeace,
    yearlyDrift: yearlyDrift, updateContacts: updateContacts,
    maxTrade: maxTrade, formTrade: formTrade, breakTradeAndTreaty: breakTradeAndTreaty,
    offerTribute: offerTribute, tributeTech: tributeTech,
    evalProposal: evalProposal, tradableTechs: tradableTechs, exchangeTech: exchangeTech
  };
})();
