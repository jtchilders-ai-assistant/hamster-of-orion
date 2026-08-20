/* Hamster of Orion — turn sequencing (manual: Next Turn) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  // relative power rating used by AI & council & status screen
  function powerOf(g, emp) {
    if (emp.dead) return 0;
    var p = 0;
    // fleet
    g.fleets.forEach(function (f) {
      if (f.empire !== emp.id) return;
      f.ships.forEach(function (n, slot) {
        if (emp.designs[slot]) p += n * emp.designs[slot].cost;
      });
    });
    // colonies
    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      p += e.colony.pop * 3 + e.colony.factories * 2 + e.colony.bases * 60;
    });
    // tech
    HOO.CONST.FIELDS.forEach(function (f) { p += HOO.State.techLevel(emp, f) * 25; });
    return p;
  }

  function powerRank(g, emp) {
    var powers = g.empires.filter(function (e) { return !e.dead; })
      .map(function (e) { return { id: e.id, p: powerOf(g, e) }; })
      .sort(function (a, b) { return b.p - a.p; });
    for (var i = 0; i < powers.length; i++) if (powers[i].id === emp.id) return i;
    return powers.length;
  }

  function eliminateEmpire(g, emp) {
    if (emp.dead) return;
    emp.dead = true;
    g.fleets = g.fleets.filter(function (f) { return f.empire !== emp.id; });
    g.transports = g.transports.filter(function (t) { return t.empire !== emp.id; });
    g.notices.push({
      type: 'gnn', name: 'An Empire Falls',
      text: 'The ' + HOO.DATA.raceById[emp.raceId].name + ' have been eliminated. Their worlds are silent; their name passes into legend.'
    });
    if (emp.isPlayer) {
      g.gameOver = { defeat: true, how: 'eliminated' };
    } else {
      var alive = g.empires.filter(function (e) { return !e.dead; });
      if (alive.length === 1 && alive[0].isPlayer) {
        g.gameOver = { victory: 'domination', winner: 0, how: 'conquest' };
      } else if (alive.length === 1) {
        g.gameOver = { defeat: true, winner: alive[0].id, how: 'conquest' };
      }
    }
  }

  /*
    Advance one year.
    Returns { combats: [...battles for player], notices, discoveries, council: record|null }
    Player-involved battles are queued; UI resolves them (manual or auto), then calls finishTurn.
  */
  function nextTurn(g) {
    g.notices = [];
    g.turn++;
    g.year++;

    // 1. AI planning
    g.empires.forEach(function (emp) { HOO.AI.planTurn(g, emp); });

    // 2. economy: production, construction, ecology, research
    var discoveries = [];
    g.empires.forEach(function (emp) {
      if (emp.dead) return;
      HOO.Colony.empireEconomy(g, emp);
      var researchPts = 0;
      HOO.Colony.colonies(g, emp.id).forEach(function (e) {
        var out = HOO.Colony.processColony(g, emp, e.star);
        researchPts += out.research;
        out.notices.forEach(function (n) { if (emp.isPlayer) g.notices.push(n); });
      });
      var disc = HOO.Research.processResearch(g, emp, researchPts);
      discoveries = discoveries.concat(disc);
    });

    // announce player discoveries
    discoveries.forEach(function (d) {
      if (d.empire.isPlayer) {
        g.notices.push({ type: 'discovery', tech: d.tech, text: 'Research breakthrough: ' + d.tech.name + '. ' + d.tech.desc });
      }
    });

    // 3. population growth & transports counter reset
    g.empires.forEach(function (emp) {
      if (emp.dead) return;
      HOO.Colony.colonies(g, emp.id).forEach(function (e) {
        e.colony.transported = 0;
        var res = HOO.Colony.growPopulation(g, emp, e.star);
        if (res.died && emp.isPlayer) {
          g.notices.push({ type: 'bad', text: 'The colony at ' + e.star.name + ' has perished.' });
        }
      });
      if (!HOO.Colony.colonies(g, emp.id).length) eliminateEmpire(g, emp);
    });

    // 4. movement
    var arrivals = HOO.Fleet.moveFleets(g);
    var landings = HOO.Fleet.moveTransports(g);

    // exploration on arrival
    arrivals.forEach(function (a) {
      var emp = g.empires[a.fleet.empire];
      if (!a.star.explored[emp.id]) {
        a.star.explored[emp.id] = true;
        if (emp.isPlayer) {
          var p = a.star.planet;
          var txt;
          if (!p) txt = 'Scouts report ' + a.star.name + ' has no planets capable of supporting life.';
          else {
            var def = HOO.CONST.PLANET_TYPES[p.type];
            var sp = HOO.CONST.SPECIALS[p.special];
            txt = 'Scouts have explored ' + a.star.name + ': a ' + def.name.toLowerCase() + ' world, size ' + p.size + (sp.name ? ', ' + sp.name : '') + '.';
          }
          g.notices.push({ type: 'explore', text: txt, starId: a.star.id });
        }
      }
    });

    // 5. combat detection at every star
    var combats = [];
    g.stars.forEach(function (star) {
      var here = HOO.Fleet.fleetsAt(g, star.id);
      if (!here.length) return;
      var empIds = [];
      here.forEach(function (f) { if (empIds.indexOf(f.empire) < 0) empIds.push(f.empire); });
      var colonyEmp = star.planet && star.planet.colony ? star.planet.colony.empire : null;

      // guardian defends Orion
      if (star.orion && g.guardian.alive) {
        empIds.forEach(function (eid) {
          combats.push({ star: star, attackerEmp: eid, guardian: true });
        });
        return;
      }

      // fleet vs fleet/colony hostilities
      for (var i = 0; i < empIds.length; i++) {
        for (var j = i + 1; j < empIds.length; j++) {
          var a = g.empires[empIds[i]], b = g.empires[empIds[j]];
          if (hostile(g, a, b, star)) combats.push({ star: star, attackerEmp: pickAttacker(a, b, colonyEmp), defenderEmp: null, pair: [a.id, b.id] });
        }
      }
      // fleets vs colony with bases and no orbiting fleet of the owner
      if (colonyEmp !== null) {
        empIds.forEach(function (eid) {
          if (eid === colonyEmp) return;
          var a2 = g.empires[eid], b2 = g.empires[colonyEmp];
          if (empIds.indexOf(colonyEmp) < 0 && hostile(g, a2, b2, star) && star.planet.colony.bases > 0) {
            combats.push({ star: star, attackerEmp: eid, pair: [eid, colonyEmp], basesOnly: true });
          }
        });
      }
    });

    function hostile(g2, a, b, star2) {
      var rel = a.relations[b.id];
      if (!rel) return false;
      if (rel.war) return true;
      if (rel.treaty === 'alliance') return false;
      // encounters over one's colony: intruder provokes defense
      var colEmp = star2.planet && star2.planet.colony ? star2.planet.colony.empire : null;
      if (colEmp === a.id || colEmp === b.id) {
        if (rel.treaty === 'nonAggression' && U.rand() < 0.6) return false;
        HOO.Diplomacy.adjust(g2, a.id, b.id, -5, true);
        HOO.Diplomacy.adjust(g2, b.id, a.id, -5, true);
        return true;
      }
      if (rel.treaty === 'nonAggression') return false;
      // neutral encounter over unclaimed system: minor incident
      HOO.Diplomacy.adjust(g2, a.id, b.id, -2, true);
      HOO.Diplomacy.adjust(g2, b.id, a.id, -2, true);
      return U.rand() < 0.3;
    }

    function pickAttacker(a, b, colonyEmp) {
      if (colonyEmp === a.id) return b.id;
      if (colonyEmp === b.id) return a.id;
      return U.chance(0.5) ? a.id : b.id;
    }

    // resolve or queue combats
    var playerCombats = [];
    combats.forEach(function (cb) {
      var battle = buildBattle(g, cb);
      if (!battle) return;
      var involvesPlayer = (cb.pair && cb.pair.indexOf(0) >= 0) || (cb.guardian && cb.attackerEmp === 0);
      if (involvesPlayer && !g.empires[0].dead) {
        playerCombats.push({ meta: cb, battle: battle });
      } else {
        HOO.Combat.autoResolve(battle);
        HOO.Combat.applyResults(g, battle);
        afterBattle(g, cb, battle);
      }
    });

    // 6. transports land (after combat)
    landings.forEach(function (t) {
      var ns = HOO.Ground.resolveLanding(g, t);
      ns.forEach(function (n) {
        var involved = t.empire === 0 || (g.stars[t.to].planet && g.stars[t.to].planet.colony && g.stars[t.to].planet.colony.empire === 0);
        if (involved || g.stars[t.to].explored[0]) g.notices.push(n);
      });
    });

    // 7. espionage
    var spyNotes = HOO.Espionage.resolveAll(g);
    spyNotes.forEach(function (n) { if (n.to === 0) g.notices.push({ type: 'spy', text: n.text }); });

    // 8. diplomacy drift & contacts
    HOO.Diplomacy.yearlyDrift(g);
    var contacts = HOO.Diplomacy.updateContacts(g);
    contacts.forEach(function (pair) {
      if (pair[0].isPlayer || pair[1].isPlayer) {
        var other = pair[0].isPlayer ? pair[1] : pair[0];
        var race = HOO.DATA.raceById[other.raceId];
        g.notices.push({
          type: 'contact', empId: other.id,
          text: 'First contact with the ' + race.name + '. ' + race.lore
        });
      }
    });

    // 9. events
    HOO.EventsRun.maybeFire(g).forEach(function (n) { g.notices.push(n); });
    HOO.EventsRun.progress(g).forEach(function (n) { g.notices.push(n); });

    // 10. council
    var council = null;
    if (HOO.Council.shouldConvene(g)) council = HOO.Council.holdElection(g);

    g.rngState = U.getRngState();
    return { playerCombats: playerCombats, council: council, notices: g.notices };
  }

  function buildBattle(g, cb) {
    var star = cb.star;
    if (cb.guardian) {
      var emp = g.empires[cb.attackerEmp];
      var fleets = HOO.Fleet.fleetsAt(g, star.id).filter(function (f) { return f.empire === cb.attackerEmp; });
      if (!fleets.length) return null;
      var mon = {
        name: 'Guardian of Orion', maxHits: g.guardian.maxHits, hits: g.guardian.hits,
        attack: 10, defense: 9, shield: 13, ecm: 8, speed: 2, initiative: 25,
        weaponIds: ['stellar_converter', 'plasma_torpedoes', 'scatter_pack_x_missiles', 'scatter_pack_x'],
        weaponCount: 3, specials: {}
      };
      g.guardian.monsterRef = mon;
      return HOO.Combat.createBattle(g, {
        star: star,
        attacker: { empId: cb.attackerEmp, fleets: fleets },
        defender: { monster: mon }
      });
    }
    var aId = cb.attackerEmp;
    var bId = cb.pair[0] === aId ? cb.pair[1] : cb.pair[0];
    var aF = HOO.Fleet.fleetsAt(g, star.id).filter(function (f) { return f.empire === aId; });
    var bF = HOO.Fleet.fleetsAt(g, star.id).filter(function (f) { return f.empire === bId; });
    var bHasColony = star.planet && star.planet.colony && star.planet.colony.empire === bId;
    var aHasColony = star.planet && star.planet.colony && star.planet.colony.empire === aId;
    if (aHasColony && !bHasColony) { // swap: colony owner defends
      var t = aId; aId = bId; bId = t;
      var tf = aF; aF = bF; bF = tf;
      bHasColony = true;
    }
    if (!aF.length && !bF.length) return null;
    if (!aF.length) return null;
    if (!bF.length && !(bHasColony && star.planet.colony.bases > 0)) return null;
    return HOO.Combat.createBattle(g, {
      star: star,
      attacker: { empId: aId, fleets: aF },
      defender: { empId: bId, fleets: bF, withBases: bHasColony }
    });
  }

  function afterBattle(g, cb, battle) {
    var star = cb.star;
    if (cb.guardian) {
      var mon = g.guardian.monsterRef;
      if (mon && mon.hits <= 0) {
        g.guardian.alive = false;
        g.notices.push({
          type: 'gnn', name: 'The Guardian Falls',
          text: 'The Guardian of Orion has been destroyed by the ' + HOO.DATA.raceById[g.empires[cb.attackerEmp].raceId].name + '. The Throne of the Ancients lies open.'
        });
        // spoils: a top-tier technology
        var emp = g.empires[cb.attackerEmp];
        var gift = ['death_ray', 'mauler_device', 'stellar_converter'].filter(function (id) {
          return HOO.DATA.techById[id] && !emp.techFlags[id];
        });
        if (gift.length) HOO.State.grantTech(emp, gift[0]);
      } else if (mon) {
        g.guardian.hits = Math.max(1, mon.hits);
      }
      return;
    }
    // battle report notice
    if (battle && (cb.pair.indexOf(0) >= 0 || star.explored[0])) {
      var w = battle.winner;
      var winnerName = w === null ? null :
        HOO.DATA.raceById[g.empires[battle.sides[w].empId].raceId].name;
      g.notices.push({
        type: 'battle', starId: star.id,
        text: 'Battle at ' + star.name + (winnerName ? (': the ' + winnerName + ' hold the system.') : ': mutual annihilation.')
      });
    }
  }

  HOO.Turn = {
    nextTurn: nextTurn, powerOf: powerOf, powerRank: powerRank,
    eliminateEmpire: eliminateEmpire, afterBattle: afterBattle
  };
})();
