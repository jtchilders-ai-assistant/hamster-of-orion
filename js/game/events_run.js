/* Hamster of Orion — crises & disasters runtime */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  function fill(tmpl, ctx) {
    return tmpl.replace('{colony}', ctx.colony || '').replace('{race}', ctx.race || '').replace('{star}', ctx.star || '');
  }

  function randomColonyOf(g, emp) {
    var cols = HOO.Colony.colonies(g, emp.id);
    return cols.length ? U.pick(cols) : null;
  }

  // called once per year; may fire one event
  function maybeFire(g) {
    var notices = [];
    if (g.turn < 30) return notices; // grace period
    g.eventCooldown--;
    var chance = Math.max(0.02, (0 - g.eventCooldown) * 0.015 + 0.03);
    if (g.eventCooldown > 0 || !U.chance(chance)) return notices;
    g.eventCooldown = U.rint(6, 14);

    var alive = g.empires.filter(function (e) { return !e.dead; });
    var emp = U.pick(alive);
    var target = randomColonyOf(g, emp);
    if (!target) return notices;
    var ev = weightedPick(HOO.DATA.EVENTS);
    var c = target.colony, star = target.star, p = star.planet;
    var raceName = HOO.DATA.raceById[emp.raceId].name;
    var ctx = { colony: star.name, race: raceName, star: star.name };

    switch (ev.id) {
      case 'derelict': {
        var fields = ['forceFields', 'weapons'];
        fields.forEach(function (f) {
          var ch = HOO.Research.choices(emp, f);
          if (ch.length) HOO.State.grantTech(emp, ch[0].id);
        });
        break;
      }
      case 'climate': p.climateShift = true; break;
      case 'comet': {
        g.comet = { starId: star.id, empId: emp.id, strength: U.rint(20, 60), eta: U.rint(4, 8) };
        break;
      }
      case 'virus': {
        var f2 = U.pick(HOO.CONST.FIELDS);
        var pr = emp.research.projects[f2];
        if (pr) pr.invested *= 0.2;
        break;
      }
      case 'blunder': {
        var others = alive.filter(function (o) { return o.id !== emp.id && emp.relations[o.id].contact; });
        if (others.length) {
          var o2 = U.pick(others);
          HOO.Diplomacy.adjust(g, o2.id, emp.id, -30, true);
          ctx.race = HOO.DATA.raceById[o2.raceId].name;
        }
        break;
      }
      case 'donation': emp.reserve += Math.round((emp.economy ? emp.economy.totalRaw : 100) * U.rint(4, 8) / 10); break;
      case 'earthquake': {
        c.pop = Math.max(1, c.pop * (1 - U.rint(10, 30) / 100));
        c.factories = Math.max(0, c.factories * (1 - U.rint(20, 40) / 100));
        break;
      }
      case 'accident': p.waste = Math.min(p.size * 0.75, p.size * 0.6); break;
      case 'mineral_rich': {
        if (p.special === 'none' || p.special === 'poor') p.special = 'rich';
        else return notices;
        break;
      }
      case 'mineral_poor': {
        if (p.special === 'none') p.special = 'poor';
        else if (p.special === 'rich') p.special = 'none';
        else return notices;
        break;
      }
      case 'piracy': g.pirates = { starId: star.id, victim: emp.id, strength: U.rint(10, 30) }; break;
      case 'plague': c.plague = true; c.quarantine = true; c.plagueNeed = U.rint(200, 600); c.plagueProgress = 0; break;
      case 'rebellion': {
        if (star.id === emp.homeStarId) return notices;
        c.inRebellion = true; c.rebels = Math.ceil(c.pop * 0.5);
        break;
      }
      case 'monster': {
        g.monster = {
          name: 'The Devourer', x: star.x, y: star.y, targetStarId: star.id,
          maxHits: 3000, hits: 3000, attack: 8, defense: 7, shield: 8, ecm: 6,
          speed: 2, initiative: 15, weaponIds: [], weaponCount: 6, specials: {}
        };
        break;
      }
      case 'supernova': c.novaThreat = true; c.novaNeed = U.rint(300, 800); c.novaProgress = 0; c.novaYears = U.rint(6, 10); break;
    }

    var text = fill(ev.text, ctx);
    notices.push({ type: 'event', good: ev.good, name: ev.name, text: text, empId: emp.id });
    return notices;
  }

  function weightedPick(list) {
    var tw = list.reduce(function (a, e) { return a + e.weight; }, 0);
    var r = U.rand() * tw;
    for (var i = 0; i < list.length; i++) { r -= list[i].weight; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }

  // ongoing event progression each year
  function progress(g) {
    var notices = [];

    // comet
    if (g.comet) {
      var star = g.stars[g.comet.starId];
      var fleets = HOO.Fleet.fleetsAt(g, star.id).filter(function (f) { return f.empire === g.comet.empId; });
      var guns = 0;
      fleets.forEach(function (f) {
        var emp = g.empires[f.empire];
        f.ships.forEach(function (n, slot) {
          if (emp.designs[slot]) guns += n * (emp.designs[slot].cost / 20);
        });
      });
      g.comet.strength -= guns;
      g.comet.eta--;
      if (g.comet.strength <= 0) {
        notices.push({ type: 'event', good: true, name: 'Comet Destroyed', text: 'The fleet at ' + star.name + ' has shattered the comet. The colony is saved.' });
        g.comet = null;
      } else if (g.comet.eta <= 0) {
        if (star.planet.colony) {
          star.planet.colony = null;
          notices.push({ type: 'event', good: false, name: 'Impact', text: 'The comet has struck ' + star.name + '. The colony has been obliterated.' });
        }
        g.comet = null;
      }
    }

    // pirates: cleared by ships present
    if (g.pirates) {
      var pstar = g.stars[g.pirates.starId];
      var pf = HOO.Fleet.fleetsAt(g, pstar.id).filter(function (f) { return f.empire === g.pirates.victim; });
      var power = 0;
      pf.forEach(function (f) {
        var emp = g.empires[f.empire];
        f.ships.forEach(function (n, slot) { if (emp.designs[slot]) power += n * emp.designs[slot].cost / 30; });
      });
      g.pirates.strength -= power;
      if (g.pirates.strength <= 0) {
        notices.push({ type: 'event', good: true, name: 'Pirates Crushed', text: 'Patrols at ' + pstar.name + ' have burned out the pirate holdouts. Trade resumes.' });
        g.pirates = null;
      }
    }

    // space monster wanders and eats colonies
    if (g.monster) {
      var m = g.monster;
      var tstar = g.stars[m.targetStarId];
      var d = U.dist(m.x, m.y, tstar.x, tstar.y);
      var step = m.speed * HOO.Galaxy.PARSEC;
      if (d <= step) {
        m.x = tstar.x; m.y = tstar.y;
        // battle any defenders
        var defenders = HOO.Fleet.fleetsAt(g, tstar.id);
        if (defenders.length) {
          var defEmp = g.empires[defenders[0].empire];
          var battle = HOO.Combat.createBattle(g, {
            star: tstar,
            attacker: { monster: m },
            defender: { empId: defEmp.id, fleets: defenders.filter(function (f) { return f.empire === defEmp.id; }), withBases: tstar.planet && tstar.planet.colony && tstar.planet.colony.empire === defEmp.id }
          });
          HOO.Combat.autoResolve(battle);
          HOO.Combat.applyResults(g, battle);
          if (m.hits <= 0) {
            notices.push({ type: 'event', good: true, name: 'The Monster Falls', text: 'The fleet of the ' + HOO.DATA.raceById[defEmp.raceId].name + ' has slain the Devourer at ' + tstar.name + '.' });
            g.monster = null;
            return notices;
          }
        }
        if (tstar.planet && tstar.planet.colony) {
          tstar.planet.colony = null;
          notices.push({ type: 'event', good: false, name: 'Colony Devoured', text: 'The Devourer has consumed all life at ' + tstar.name + '.' });
        }
        // pick next inhabited target
        var targets = g.stars.filter(function (s) { return s.planet && s.planet.colony; });
        if (targets.length && U.chance(0.8)) {
          var nt = targets.sort(function (a, b) {
            return U.dist(m.x, m.y, a.x, a.y) - U.dist(m.x, m.y, b.x, b.y);
          })[0];
          m.targetStarId = nt.id;
        } else g.monster = null;
      } else {
        m.x += (tstar.x - m.x) / d * step;
        m.y += (tstar.y - m.y) / d * step;
      }
    }

    // plagues & novas absorb colony research
    g.stars.forEach(function (s) {
      if (!s.planet || !s.planet.colony) return;
      var c = s.planet.colony;
      var emp = g.empires[c.empire];
      if (c.plague) {
        var rp = HOO.Colony.rawProduction(emp, s) * (c.alloc.tech / 100 + 0.3);
        c.plagueProgress += rp;
        c.pop = Math.max(1, c.pop - c.pop * 0.04);
        if (c.plagueProgress >= c.plagueNeed) {
          c.plague = false; c.quarantine = false;
          notices.push({ type: 'event', good: true, name: 'Cure Found', text: 'The laboratories of ' + s.name + ' have synthesized a cure. The quarantine is lifted.' });
        }
      }
      if (c.novaThreat) {
        var rp2 = HOO.Colony.rawProduction(emp, s) * (c.alloc.tech / 100 + 0.3);
        c.novaProgress += rp2;
        c.novaYears--;
        if (c.novaProgress >= c.novaNeed) {
          c.novaThreat = false;
          notices.push({ type: 'event', good: true, name: 'Star Stabilized', text: 'The primary of ' + s.name + ' has been stabilized. The system is safe.' });
        } else if (c.novaYears <= 0) {
          c.pop = Math.max(0, c.pop * 0.1);
          c.factories = Math.max(0, c.factories * 0.05);
          c.novaThreat = false;
          notices.push({ type: 'event', good: false, name: 'Super Nova', text: 'The star of ' + s.name + ' has erupted. The colony lies in ashes.' });
          if (c.pop < 1) s.planet.colony = null;
        }
      }
    });

    return notices;
  }

  HOO.EventsRun = { maybeFire: maybeFire, progress: progress };
})();
