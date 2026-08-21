/* Hamster of Orion — the High Council (manual: Winning The Game) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  function colonizedFraction(g) {
    var habitable = 0, colonized = 0;
    g.stars.forEach(function (s) {
      if (s.planet && !s.orion) {
        habitable++;
        if (s.planet.colony) colonized++;
      }
    });
    return habitable ? colonized / habitable : 0;
  }

  function votesOf(g, emp) {
    var pop = 0;
    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      if (!e.colony.inRebellion) pop += e.colony.pop;
    });
    return Math.max(1, Math.floor(pop / 100 * 2)); // 1 vote per ~50 pop keeps small games interesting
  }

  function shouldConvene(g) {
    if (g.council.finalWar || g.gameOver) return false;
    // manual: the council first convenes once two-thirds of the galaxy is colonized
    if (colonizedFraction(g) < 2 / 3) return false;
    var alive = g.empires.filter(function (e) { return !e.dead; });
    if (alive.length < 2) return false;
    return (g.year - (g.council.lastVote || 0)) >= 25 || !g.council.formed;
  }

  // returns election record
  function holdElection(g) {
    g.council.formed = true;
    g.council.lastVote = g.year;

    var alive = g.empires.filter(function (e) { return !e.dead; });
    var ranked = alive.slice().sort(function (a, b) { return votesOf(g, b) - votesOf(g, a); });
    var cand = [ranked[0], ranked[1]];

    var record = {
      year: g.year, candidates: cand.map(function (c) { return c.id; }),
      votes: {}, totals: {}, totalVotes: 0, abstained: 0, winner: null
    };
    record.totals[cand[0].id] = 0;
    record.totals[cand[1].id] = 0;

    alive.forEach(function (emp) {
      var v = votesOf(g, emp);
      record.totalVotes += v;
      var choice = null;
      // the player always chooses freely — even as a candidate they may
      // vote for themselves, the rival, or abstain (manual: Winning the Game)
      if (emp.isPlayer) choice = 'PLAYER_CHOICE';
      else if (emp.id === cand[0].id) choice = cand[0].id;
      else if (emp.id === cand[1].id) choice = cand[1].id;
      else {
        // vote by relations (+ Orion holder sway, Hamster council bonus)
        var s0 = score(g, emp, cand[0]), s1 = score(g, emp, cand[1]);
        if (Math.max(s0, s1) < -20) choice = null; // abstain
        else choice = s0 >= s1 ? cand[0].id : cand[1].id;
      }
      record.votes[emp.id] = { votes: v, choice: choice };
      if (choice && choice !== 'PLAYER_CHOICE') record.totals[choice] += v;
      else if (!choice) record.abstained += v;
    });
    return record;
  }

  function score(g, emp, candidate) {
    var rel = emp.relations[candidate.id];
    var s = rel ? rel.value : 0;
    var race = HOO.DATA.raceById[candidate.raceId];
    if (race.councilBonus) s += race.councilBonus;
    // fear of military
    var p = HOO.Turn.powerOf(g, candidate);
    var mine = HOO.Turn.powerOf(g, emp);
    if (p > mine * 2) s += 10;
    // whoever holds Orion sways votes
    var orion = g.stars[g.orionStarId];
    if (orion.planet.colony && orion.planet.colony.empire === candidate.id) s += 25;
    if (rel && rel.war) s -= 40;
    if (rel && rel.treaty === 'alliance') s += 25;
    return s;
  }

  // finalize after any player choice is folded in
  function finalize(g, record, playerChoice) {
    if (record.votes[0] && record.votes[0].choice === 'PLAYER_CHOICE') {
      var v = record.votes[0].votes;
      if (playerChoice === null || playerChoice === undefined) record.abstained += v;
      else record.totals[playerChoice] = (record.totals[playerChoice] || 0) + v;
      record.votes[0].choice = playerChoice;
    }
    var need = Math.ceil(record.totalVotes * 2 / 3);
    record.needed = need;
    var winner = null;
    record.candidates.forEach(function (cid) {
      if (record.totals[cid] >= need) winner = cid;
    });
    record.winner = winner;
    return record;
  }

  // player (or AI candidate) rejects the council's ruling → final war
  function rejectRuling(g, rebelId) {
    g.council.finalWar = true;
    g.council.rebel = rebelId;
    g.empires.forEach(function (emp) {
      if (emp.dead || emp.id === rebelId) return;
      var rel = emp.relations[rebelId];
      if (rel) {
        // noRipple: the united galaxy's wars are set explicitly below
        HOO.Diplomacy.declareWar(g, emp.id, rebelId, true);
        rel.permanentPenalty -= 30;
      }
      // the galaxy unites
      g.empires.forEach(function (o) {
        if (o.dead || o.id === rebelId || o.id === emp.id) return;
        emp.relations[o.id].war = false;
        emp.relations[o.id].treaty = 'alliance';
        emp.relations[o.id].value = Math.max(emp.relations[o.id].value, 50);
      });
    });
  }

  function acceptRuling(g, record) {
    g.council.highMaster = record.winner;
    g.gameOver = {
      victory: record.winner === 0 ? 'diplomatic' : null,
      defeat: record.winner !== 0,
      winner: record.winner,
      how: 'council'
    };
  }

  HOO.Council = {
    colonizedFraction: colonizedFraction, votesOf: votesOf,
    shouldConvene: shouldConvene, holdElection: holdElection,
    finalize: finalize, rejectRuling: rejectRuling, acceptRuling: acceptRuling
  };
})();
