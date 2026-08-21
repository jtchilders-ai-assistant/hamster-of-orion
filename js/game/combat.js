/* Hamster of Orion — tactical space combat (manual: Ship Combat / Combat Resolution) */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var COLS = 10, ROWS = 8;

  // to-hit: roll 1-100 must be >= needed; needed = 50 + 10*(defense - attack), capped at 95
  function hitNeeded(attack, defense) {
    return Math.min(95, 50 + 10 * (defense - attack));
  }

  function rollDamage(dmin, dmax, roll, need) {
    if (need >= 100) return 0;
    var frac = (roll - need) / (100 - need);
    return dmin + (dmax - dmin) * U.clamp(frac, 0, 1);
  }

  function cheb(ax, ay, bx, by) { return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); }

  // effect data for a special device by its effect.special name (single source
  // of truth for shoot-down percentages, displacement miss chance, etc.)
  var specialFxCache = null;
  function specialFx(name) {
    if (!specialFxCache) {
      specialFxCache = {};
      Object.keys(HOO.DATA.techById).forEach(function (id) {
        var e = HOO.DATA.techById[id].effect;
        if (e && e.type === 'special' && e.special) specialFxCache[e.special] = e;
      });
    }
    return specialFxCache[name] || {};
  }

  // ---------- stack construction ----------

  function stackFromDesign(emp, slot, design, count, side) {
    var weapons = design.weapons.map(function (w) {
      var t = HOO.DATA.techById[w.id];
      return {
        tech: t, count: w.count,
        // missile racks come in 2- and 5-shot fits chosen at design time
        shotsLeft: t.effect.wclass === 'missile' ? (w.rack || t.effect.shots || 5) :
          ((t.effect.wclass === 'bomb' || t.effect.wclass === 'bio') ? 10 : Infinity),
        usedThisRound: false
      };
    });
    var specials = {};
    design.specials.forEach(function (sid) { specials[HOO.DATA.techById[sid].effect.special] = true; });
    var race = HOO.DATA.raceById[emp.raceId];
    return {
      kind: 'ship', side: side, empId: emp.id, slot: slot,
      name: design.name, design: design,
      count: count, startCount: count, topDamage: 0,
      hits: design.hits, attack: design.attack, defense: design.defense,
      shield: design.shieldCls, ecm: design.ecmMark,
      speed: design.combatSpeed, initiative: design.initiative,
      firstStrike: !!(race && race.firstStrike), // race trait: fire first in round 1
      weapons: weapons, specials: specials,
      x: 0, y: 0, done: false, retreated: false, retreating: false, cloaked: !!specials.cloak,
      stasisLeft: 0, speedDrain: 0, compDrain: 0,
      missilesOn: true
    };
  }

  function baseStack(g, emp, star, side) {
    var c = star.planet.colony;
    var missile = null;
    HOO.State.allKnown(emp, function (t) {
      return t.effect.type === 'weapon' && t.effect.wclass === 'missile';
    }).forEach(function (t) { if (!missile || t.level > missile.level) missile = t; });
    if (!missile) missile = HOO.DATA.techById['nuclear_missile'];
    var comp = HOO.State.bestTech(emp, 'computer');
    var defl = star.inNebula ? 0 : emp.derived.deflector;
    var pshield = star.inNebula ? 0 : c.shield;
    return {
      kind: 'base', side: side, empId: emp.id, slot: -1,
      name: 'Missile Bases', star: star,
      count: c.bases, startCount: c.bases, topDamage: 0,
      hits: HOO.CONST.BASE_HITS,
      attack: (comp ? comp.effect.mark : 0) + 1, // bases carry battle scanners
      defense: 1, shield: defl + pshield,
      ecm: (HOO.State.bestTech(emp, 'ecm') || { effect: { mark: 0 } }).effect.mark,
      speed: 0, initiative: (comp ? comp.effect.mark : 0) + 3,
      weapons: missile ? [{ tech: missile, count: 3, shotsLeft: Infinity, usedThisRound: false }] : [],
      specials: {}, x: 0, y: 0, done: false, retreated: false, retreating: false, cloaked: false,
      stasisLeft: 0, speedDrain: 0, compDrain: 0, missilesOn: true,
      planetary: true
    };
  }

  function monsterStack(mon, side) {
    // guardian / space monster pseudo-stacks
    var weapons = mon.weaponIds.map(function (wid) {
      var t = HOO.DATA.techById[wid];
      if (!t) return null;
      return { tech: t, count: mon.weaponCount || 4, shotsLeft: Infinity, usedThisRound: false };
    }).filter(Boolean);
    if (!weapons.length) {
      weapons = [{
        tech: { id: 'monster_maw', name: 'Annihilation Field', level: 40, cat: 'weapons', effect: { type: 'weapon', wclass: 'beam', dmin: 20, dmax: 60, range: 2, size: 0, power: 0, cost: 0 } },
        count: 4, shotsLeft: Infinity, usedThisRound: false
      }];
    }
    return {
      kind: 'monster', side: side, empId: -1, slot: -1,
      name: mon.name, count: 1, startCount: 1, topDamage: mon.maxHits - mon.hits,
      hits: mon.maxHits, attack: mon.attack, defense: mon.defense,
      shield: mon.shield, ecm: mon.ecm || 5,
      speed: mon.speed, initiative: mon.initiative,
      weapons: weapons, specials: mon.specials || {},
      x: 0, y: 0, done: false, retreated: false, retreating: false, cloaked: false,
      stasisLeft: 0, speedDrain: 0, compDrain: 0, missilesOn: true
    };
  }

  // ---------- battle setup ----------

  /*
    sides: {empId or 'guardian'/'monster'} ; defender owns colony if present
    opts: {attackerEmp, defenderEmp, star, monster}
  */
  function createBattle(g, opts) {
    var b = {
      g: g, star: opts.star,
      sides: [opts.attacker, opts.defender], // {empId} or {monster}
      stacks: [], missiles: [],
      round: 0, order: [], orderIdx: -1,
      log: [], over: false, winner: null,
      interdictor: false
    };

    [0, 1].forEach(function (side) {
      var sd = b.sides[side];
      if (sd.monster) {
        var ms = monsterStack(sd.monster, side);
        b.stacks.push(ms);
        return;
      }
      var emp = g.empires[sd.empId];
      if (sd.fleets) {
        // aggregate ships by design slot across fleets
        var totals = [0, 0, 0, 0, 0, 0];
        sd.fleets.forEach(function (f) {
          for (var i = 0; i < 6; i++) totals[i] += f.ships[i];
        });
        for (var slot = 0; slot < 6; slot++) {
          if (totals[slot] > 0 && emp.designs[slot]) {
            b.stacks.push(stackFromDesign(emp, slot, emp.designs[slot], totals[slot], side));
          }
        }
      }
      // many stars have no planet at all (rollPlanet returns null), so every
      // planet dereference here needs the guard — an interdictor-equipped
      // defender meeting a fleet at a barren star used to abort the turn
      var col = opts.star && opts.star.planet ? opts.star.planet.colony : null;
      if (sd.withBases && col && col.bases > 0) {
        b.stacks.push(baseStack(g, emp, opts.star, side));
      }
      if (emp && emp.derived.hasInterdictor && side === 1 && col &&
        col.empire === emp.id) b.interdictor = true;
    });

    // nebula: deflector shields are inoperative for every combatant (manual: Nebulas);
    // bases already lose theirs in baseStack()
    if (opts.star && opts.star.inNebula) {
      b.stacks.forEach(function (s) { if (s.kind !== 'base') s.shield = 0; });
    }

    // positions: side 0 left column, side 1 right; never two stacks on one cell
    [0, 1].forEach(function (side) {
      var ss = b.stacks.filter(function (s) { return s.side === side; });
      var col = side === 0 ? 0 : COLS - 1;
      var taken = {};
      ss.forEach(function (s) {
        if (s.planetary) {
          s.x = COLS - 1; s.y = Math.floor(ROWS / 2);
          taken[s.x + ',' + s.y] = true;
        }
      });
      ss.forEach(function (s, i) {
        if (s.planetary) return;
        var y = Math.floor(ROWS / 2 - ss.length / 2 + i + ROWS) % ROWS;
        while (taken[col + ',' + y]) y = (y + 1) % ROWS; // slide past occupied cells
        s.x = col; s.y = y;
        taken[col + ',' + y] = true;
      });
    });

    beginRound(b);
    return b;
  }

  function alive(b, side) {
    return b.stacks.filter(function (s) { return s.side === side && s.count > 0 && !s.retreated; });
  }

  function beginRound(b) {
    b.round++;
    b.stacks.forEach(function (s) {
      s.done = s.count <= 0 || s.retreated;
      s.moved = 0;
      if (s.stasisLeft > 0) s.stasisLeft--;
      s.weapons.forEach(function (w) { w.usedThisRound = false; });
    });
    // first-strike races (Ferrets) always act first in the opening round
    b.order = b.stacks.filter(function (s) { return s.count > 0 && !s.retreated; })
      .sort(function (a, c) {
        var ai = a.initiative + (b.round === 1 && a.firstStrike ? 1000 : 0);
        var ci = c.initiative + (b.round === 1 && c.firstStrike ? 1000 : 0);
        return ci - ai || U.rand() - 0.5;
      });
    b.orderIdx = -1;
  }

  function nextStack(b) {
    while (true) {
      b.orderIdx++;
      if (b.orderIdx >= b.order.length) {
        endRound(b);
        if (b.over) return null;
        beginRound(b);
        continue;
      }
      var s = b.order[b.orderIdx];
      if (s.count <= 0 || s.retreated || s.done) continue;
      if (s.stasisLeft > 0) { s.done = true; continue; }
      if (s.retreating) {
        // a fleeing stack warps out at the start of its NEXT turn — it spent a
        // full round exposed to enemy fire (manual: Retreating)
        if (s.speedDrain >= s.speed) {
          // warp dissipator snare: engines too drained to form a warp field
          s.retreating = false;
          log(b, stackLabel(s) + ' is snared — its drained engines cannot open a warp field.');
        } else {
          s.retreated = true; s.done = true;
          log(b, stackLabel(s) + ' warps out of the battle.');
          checkEnd(b);
          if (b.over) return null;
          continue;
        }
      }
      return s;
    }
  }

  // ---------- movement ----------

  function occupied(b, x, y, ignore) {
    return b.stacks.some(function (s) {
      return s !== ignore && s.count > 0 && !s.retreated && s.x === x && s.y === y;
    });
  }

  // warp dissipator drain can immobilize a ship completely (speedDrain === speed)
  function effSpeed(s) { return Math.max(0, s.speed - s.speedDrain); }

  function canMoveTo(b, s, x, y) {
    if (s.planetary) return false;
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    if (occupied(b, x, y, s)) return false;
    return cheb(s.x, s.y, x, y) <= effSpeed(s) - s.moved;
  }

  function moveStack(b, s, x, y) {
    if (!canMoveTo(b, s, x, y)) return false;
    s.moved += cheb(s.x, s.y, x, y);
    s.x = x; s.y = y;
    // moving into missile paths handled at round end; defensive fire:
    defensiveFire(b, s);
    return true;
  }

  function teleportStack(b, s, x, y) {
    if (!s.specials.teleporter || b.interdictor) return false;
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS || occupied(b, x, y, s)) return false;
    s.x = x; s.y = y; s.moved = effSpeed(s);
    return true;
  }

  // enemy stacks that still have unfired beams get a free shot at the mover
  function defensiveFire(b, mover) {
    b.stacks.forEach(function (s) {
      if (s.side === mover.side || s.count <= 0 || s.retreated || s.stasisLeft > 0) return;
      if (!s.done) return; // only ships that already had their turn
      s.weapons.forEach(function (w, wi) {
        var wc = w.tech.effect.wclass;
        if ((wc === 'beam' || wc === 'heavy') && !w.usedThisRound) {
          if (inWeaponRange(b, s, mover, w)) fireWeapon(b, s, mover, wi, true);
        }
      });
    });
  }

  // ---------- firing ----------

  function beamRangeOf(s, w) {
    var r = w.tech.effect.range || 1;
    if (s.specials.heFocus && (w.tech.effect.wclass === 'beam' || w.tech.effect.wclass === 'heavy')) r += 3;
    return r;
  }

  function inWeaponRange(b, s, t, w) {
    var wc = w.tech.effect.wclass;
    var d = cheb(s.x, s.y, t.x, t.y);
    if (wc === 'missile' || wc === 'torpedo') return d <= (w.tech.effect.range || 6);
    if (wc === 'bomb') return t.planetary && d <= 1;
    if (wc === 'bio') return t.planetary && d <= 1;
    return d <= beamRangeOf(s, w);
  }

  function anyWeaponInRange(b, s, t) {
    if (t.stasisLeft > 0) return false; // frozen stacks cannot be attacked
    for (var i = 0; i < s.weapons.length; i++) {
      var w = s.weapons[i];
      if (w.shotsLeft > 0 && inWeaponRange(b, s, t, w)) {
        var wc = w.tech.effect.wclass;
        if ((wc === 'missile') && !s.missilesOn) continue;
        return true;
      }
    }
    return false;
  }

  // apply damage points to a stack; returns ships killed
  function applyDamage(b, target, dmg, streaming) {
    if (dmg <= 0 || target.count <= 0) return 0;
    var killed = 0;
    target.topDamage += dmg;
    while (target.topDamage >= target.hits && target.count > 0) {
      if (streaming) target.topDamage -= target.hits;
      else target.topDamage = 0;
      target.count--; killed++;
      if (!streaming) break;
    }
    if (target.count <= 0) { target.count = 0; target.topDamage = 0; }
    return killed;
  }

  function shieldOf(target, firer) {
    var sh = target.shield;
    if (firer && firer.specials.oracle) sh = Math.ceil(sh / 2);
    return sh;
  }

  // fire one weapon group of a stack at target; returns total damage
  function fireWeapon(b, s, target, wi, isDefensive) {
    var w = s.weapons[wi];
    if (!w || w.usedThisRound || w.shotsLeft <= 0 || target.count <= 0) return 0;
    if (target.stasisLeft > 0) return 0; // frozen stacks cannot be attacked
    var e = w.tech.effect;
    var wc = e.wclass;
    if (!inWeaponRange(b, s, target, w)) return 0;
    if (wc === 'missile' && !s.missilesOn && !isDefensive) return 0;

    // de-cloak on firing
    if (s.cloaked) s.cloaked = false;

    var effAttack = Math.max(0, s.attack - s.compDrain);
    var d = cheb(s.x, s.y, target.x, target.y);

    // missiles & torpedoes launch as projectiles
    if (wc === 'missile' || wc === 'torpedo') {
      if (wc === 'torpedo' && w.lastFiredRound === b.round - 1) return 0; // fire every other round
      var launches = s.count * w.count * (e.autofire ? e.autofire : 1);
      b.missiles.push({
        from: s, target: target, tech: w.tech,
        count: launches, x: s.x, y: s.y,
        speed: e.mspeed || 4, life: wc === 'torpedo' ? 1 : Math.ceil(((e.range || 6)) / (e.mspeed || 4)) + 1,
        attack: effAttack + (e.targeting || 0)
      });
      w.usedThisRound = true;
      w.lastFiredRound = b.round;
      if (wc === 'missile') w.shotsLeft--;
      log(b, stackLabel(s) + ' launches ' + w.tech.name + '.');
      return 0;
    }

    // biological weapons vs the colony: ignore all shields, kill population and
    // scorch the planet itself; they never damage missile bases (manual)
    if (wc === 'bio') {
      if (!target.planetary || !target.star || !target.star.planet.colony) return 0;
      var col = target.star.planet.colony;
      var defBioEmp = b.g.empires[col.empire];
      var kill = Math.max(0, e.dmax - (defBioEmp ? defBioEmp.derived.antidote : 0));
      var bshots = s.count * w.count;
      var popKilled = Math.min(col.pop, bshots * kill * 0.5);
      var sizeLoss = bshots * kill * 0.25;
      w.usedThisRound = true; w.shotsLeft--;
      col.pop -= popKilled;
      target.star.planet.size = Math.max(10, target.star.planet.size - sizeLoss);
      target.star.planet.baseSize = Math.max(10, target.star.planet.baseSize - sizeLoss);
      // everyone despises biological weapons (once per empire per battle)
      if (s.empId >= 0) {
        b.bioUsedBy = b.bioUsedBy || {};
        if (!b.bioUsedBy[s.empId]) {
          b.bioUsedBy[s.empId] = true;
          b.g.empires.forEach(function (o) {
            if (o.id === s.empId || o.dead) return;
            HOO.Diplomacy.adjust(b.g, o.id, s.empId, -25, true);
          });
        }
      }
      if (col.pop <= 0.5) {
        target.star.planet.colony = null;
        target.count = 0; target.topDamage = 0; // the bases die with the colony
        log(b, stackLabel(s) + ' releases ' + w.tech.name + ' — all life on the colony is extinguished.');
        checkEnd(b);
      } else {
        log(b, stackLabel(s) + ' releases ' + w.tech.name + ' — ' + Math.round(popKilled) + ' million colonists perish.');
      }
      return popKilled;
    }

    // bombs vs planet: resolved shot by shot so a big run kills base after base
    if (wc === 'bomb') {
      if (!target.planetary) return 0;
      var shots = s.count * w.count;
      var dmgTot = 0, killedB = 0;
      var sh = shieldOf(target, s);
      var need = hitNeeded(effAttack, target.defense);
      var sample = Math.min(shots, 300);
      for (var i = 0; i < sample; i++) {
        var roll = U.roll100();
        if (roll >= need) {
          var dm = rollDamage(e.dmin, e.dmax, roll, need) - sh;
          if (dm > 0) { dmgTot += dm; killedB += applyDamage(b, target, dm, false); }
        }
        if (target.count <= 0) break;
      }
      if (shots > sample && target.count > 0) {
        var extraB = dmgTot * (shots - sample) / sample;
        killedB += applyDamage(b, target, extraB, true); // aggregated: kills base by base
        dmgTot += extraB;
      }
      w.usedThisRound = true; w.shotsLeft--;
      log(b, stackLabel(s) + ' bombs ' + target.name + ' — ' + Math.round(dmgTot) + ' damage' + (killedB ? ', ' + killedB + ' base(s) destroyed' : '') + '.');
      return dmgTot;
    }

    // beams
    var defense = target.defense + (target.cloaked ? 5 : 0);
    if (e.wclass === 'heavy' || e.range > 1 || s.specials.heFocus) {
      // disruptor bolts do not attenuate with distance (manual: no range penalty)
      var noPen = e.noRangePenalty || w.tech.id === 'disruptor';
      if (d > 1 && !noPen) defense += (d - 1); // extended range penalty
    }
    var need = hitNeeded(effAttack + (e.hitBonus || 0), defense);
    var sh = shieldOf(target, s);
    if (e.pierce) sh = Math.ceil(sh / 2);
    if (target.planetary) sh = shieldOf(target, s); // bases keep their combined shield

    var shots = s.count * w.count * (e.autofire || 1);
    var total = 0, killed = 0;
    var sample = Math.min(shots, 400);
    for (var k = 0; k < sample; k++) {
      // displacement device: 1 in 3 of all direct-fire attacks simply miss
      if (target.specials && target.specials.displacement && U.chance(specialFx('displacement').missChance || 1 / 3)) continue;
      var r2 = U.roll100();
      if (r2 >= need || need <= 0) {
        var dmg = rollDamage(e.dmin, e.dmax, r2, need);
        if (target.planetary) dmg *= 0.5; // atmosphere halves beams
        if (e.enveloping) {
          for (var q = 0; q < 4; q++) {
            var dq = Math.max(0, dmg / 1 - sh);
            total += dq; killed += applyDamage(b, target, dq, e.streaming);
          }
        } else {
          var da = Math.max(0, dmg - sh);
          total += da;
          killed += applyDamage(b, target, da, e.streaming);
        }
      }
      if (target.count <= 0) break;
    }
    if (shots > sample && target.count > 0) {
      var scaledExtra = total * (shots - sample) / sample;
      killed += applyDamage(b, target, scaledExtra, true); // aggregated: multi-kill
      total += scaledExtra;
    }
    w.usedThisRound = true;
    if (total > 0.5) log(b, stackLabel(s) + ' fires ' + w.tech.name + ' at ' + stackLabel(target) + ' — ' + Math.round(total) + ' damage' + (killed ? ', ' + killed + ' destroyed' : '') + '.');
    else log(b, stackLabel(s) + ' fires ' + w.tech.name + ' at ' + stackLabel(target) + ' — no effect.');

    // warp dissipator / tech nullifier side effects
    if (s.specials.warpDissipator && target.kind === 'ship') target.speedDrain = Math.min(target.speed, target.speedDrain + 1);
    if (s.specials.techNullifier && target.kind === 'ship') target.compDrain += U.rint(1, 3);
    return total;
  }

  // fire everything available at target
  function fireAll(b, s, target) {
    var did = false;
    // specials first — each activates at most once per combat round
    if (s.specials.stasis && s.stasisUsedRound !== b.round && target.kind !== 'monster' && target.stasisLeft <= 0) {
      // 2 so the freeze survives the beginRound decrement and holds a full round
      target.stasisLeft = 2;
      s.stasisUsedRound = b.round;
      log(b, stackLabel(s) + ' locks ' + stackLabel(target) + ' in a stasis field.');
      did = true;
    }
    if (s.specials.blackHole && s.blackHoleUsedRound !== b.round && target.stasisLeft <= 0 &&
      cheb(s.x, s.y, target.x, target.y) <= 1 && target.kind === 'ship') {
      s.blackHoleUsedRound = b.round;
      var pct = U.rint(25, 100) - target.shield * 2;
      var slain = Math.floor(target.count * U.clamp(pct, 0, 100) / 100);
      target.count -= slain;
      log(b, stackLabel(s) + ' opens a black hole — ' + slain + ' ships swallowed.');
      did = true;
    }
    if ((s.specials.pulsar || s.specials.ionicPulsar) && s.pulsarUsedRound !== b.round) {
      s.pulsarUsedRound = b.round;
      b.stacks.forEach(function (t2) {
        if (t2.side !== s.side && t2.count > 0 && !t2.retreated && t2.stasisLeft <= 0 &&
          cheb(s.x, s.y, t2.x, t2.y) <= 1) {
          var maxD = s.specials.ionicPulsar ? 10 + s.count : 5 + s.count / 2;
          var dm = U.rand() * maxD * s.count;
          applyDamage(b, t2, Math.max(0, dm - t2.shield), true); // aggregated wave: multi-kill
          log(b, stackLabel(s) + ' pulses energy waves into ' + stackLabel(t2) + '.');
        }
      });
      did = true;
    }
    for (var i = 0; i < s.weapons.length; i++) {
      if (target.count <= 0) break;
      if (fireWeapon(b, s, target, i) > 0) did = true;
      else if (s.weapons[i].usedThisRound) did = true;
    }
    // repulsor: push adjacent enemy away
    if (s.specials.repulsor && cheb(s.x, s.y, target.x, target.y) === 1 && !target.planetary && target.kind !== 'monster') {
      var dx = target.x - s.x, dy = target.y - s.y;
      var nx = U.clamp(target.x + Math.sign(dx), 0, COLS - 1), ny = U.clamp(target.y + Math.sign(dy), 0, ROWS - 1);
      if (!occupied(b, nx, ny, target)) { target.x = nx; target.y = ny; log(b, stackLabel(s) + ' repulses ' + stackLabel(target) + '.'); }
    }
    return did;
  }

  // ---------- missiles in flight ----------

  function stepMissiles(b) {
    b.missiles = b.missiles.filter(function (m) {
      var t = m.target;
      if (t.count <= 0 || t.retreated) return false;
      if (t.stasisLeft > 0) {
        // frozen stacks cannot be hit; missiles circle until fuel runs out
        m.life--;
        return m.life > 0;
      }
      var d = cheb(m.x, m.y, t.x, t.y);
      if (d <= m.speed) {
        // impact: anti-missile defenses (manual: 85% base −5% per missile tech level
        // for Anti-Missile Rockets; Zyro 75% and Lightning 100% at −1%/level)
        var destroyPct = 0;
        if (t.specials && t.specials.lightning) destroyPct = (specialFx('lightning').shootDownPct || 100) - m.tech.level;
        else if (t.specials && t.specials.zyro) destroyPct = (specialFx('zyro').shootDownPct || 75) - m.tech.level;
        else if (t.specials && t.specials.antiMissile) {
          var amFx = specialFx('antiMissile');
          destroyPct = (amFx.shootDownPct || 85) - m.tech.level * (amFx.shootDownPctPerLevel || 5);
        }
        var arriving = m.count;
        if (destroyPct > 0) arriving = Math.round(arriving * (1 - U.clamp(destroyPct, 0, 100) / 100));

        var e = m.tech.effect;
        var need = hitNeeded(m.attack, t.defense + (t.ecm || 0) + (t.cloaked ? 5 : 0));
        var sh = t.shield;
        var total = 0, killed = 0;
        var sample = Math.min(arriving, 400);
        for (var i = 0; i < sample; i++) {
          // displacement device: 1 in 3 of all non-area attacks simply miss
          if (t.specials && t.specials.displacement && U.chance(specialFx('displacement').missChance || 1 / 3)) continue;
          var roll = U.roll100();
          if (roll >= need || need <= 0) {
            var dmg = e.dmax; // missiles do full damage
            if (t.planetary && e.wclass === 'torpedo') dmg *= 0.5;
            if (e.enveloping) {
              for (var q = 0; q < 4; q++) { var dq = Math.max(0, dmg - sh); total += dq; killed += applyDamage(b, t, dq, false); }
            } else {
              var da = Math.max(0, dmg - sh);
              total += da; killed += applyDamage(b, t, da, false);
            }
          }
          if (t.count <= 0) break;
        }
        if (arriving > sample && t.count > 0) {
          var extra = total * (arriving - sample) / sample;
          killed += applyDamage(b, t, extra, true); // aggregated: multi-kill
          total += extra;
        }
        if (total > 0.5) log(b, m.tech.name + ' strike ' + stackLabel(t) + ' — ' + Math.round(total) + ' damage' + (killed ? ', ' + killed + ' destroyed' : '') + '.');
        else log(b, stackLabel(t) + ' evades the ' + m.tech.name + ' salvo.');
        return false;
      }
      // track target
      m.life--;
      if (m.life <= 0) return false;
      var stepx = U.clamp(t.x - m.x, -m.speed, m.speed);
      var stepy = U.clamp(t.y - m.y, -m.speed, m.speed);
      m.x += stepx; m.y += stepy;
      return true;
    });
  }

  // ---------- round end / battle end ----------

  function endRound(b) {
    stepMissiles(b);
    // auto repair: 15% / 30% of accumulated hull damage per turn (manual)
    b.stacks.forEach(function (s) {
      if (s.count <= 0 || s.retreated) return;
      if (s.specials.advDamControl && s.topDamage > 0) s.topDamage = Math.max(0, s.topDamage * 0.7);
      else if (s.specials.autoRepair && s.topDamage > 0) s.topDamage = Math.max(0, s.topDamage * 0.85);
      if (s.kind === 'monster' && s.topDamage > 0) s.topDamage = Math.max(0, s.topDamage - s.hits * 0.02);
      // re-cloak if didn't fire this round
      if (s.specials.cloak && !s.cloaked) {
        var fired = s.weapons.some(function (w) { return w.usedThisRound; });
        if (!fired) s.cloaked = true;
      }
    });
    checkEnd(b);
    if (!b.over && b.round >= HOO.CONST.COMBAT_MAX_TURNS) {
      // attacker forced to retreat
      alive(b, 0).forEach(function (s) { s.retreated = true; });
      checkEnd(b);
    }
  }

  function checkEnd(b) {
    var a0 = alive(b, 0), a1 = alive(b, 1);
    if (a0.length === 0 || a1.length === 0) {
      b.over = true;
      b.winner = a0.length ? 0 : (a1.length ? 1 : null);
    }
    return b.over;
  }

  function retreatStack(b, s) {
    if (s.planetary || s.kind === 'monster' || s.retreated) return false;
    // warp dissipator: fully drained engines cannot form a warp field
    if (s.speedDrain >= s.speed) {
      log(b, stackLabel(s) + ' cannot retreat — its engines are drained.');
      return false;
    }
    if (!s.retreating) {
      // MOO: the stack comes about and warps out at the start of its NEXT turn,
      // staying exposed to enemy fire for a full round in between
      s.retreating = true;
      log(b, stackLabel(s) + ' comes about to retreat — warping out next turn.');
    }
    s.done = true;
    return true;
  }

  // ---------- AI control of one stack ----------

  // rough combat value of a stack: hull points plus punch of remaining weapons
  function stackStrength(t) {
    var wp = 0;
    t.weapons.forEach(function (w) {
      if (w.shotsLeft > 0) wp += w.count * (w.tech.effect.dmax || 0) * (w.tech.effect.autofire || 1);
    });
    return t.count * (t.hits + wp * 2);
  }

  function aiAct(b, s) {
    if (s.stasisLeft > 0) { s.done = true; return; }
    var enemies = alive(b, s.side === 0 ? 1 : 0).filter(function (e) { return e.stasisLeft <= 0; });
    if (!enemies.length) { s.done = true; return; }

    // hopeless odds: AI warships disengage to preserve the fleet rather than
    // die in place (manual: the AI retreats when a battle is lost)
    if (s.kind === 'ship' && s.empId > 0 && b.round >= 2) {
      var mine = 0, theirs = 0;
      b.stacks.forEach(function (t2) {
        if (t2.count <= 0 || t2.retreated) return;
        var st = stackStrength(t2);
        if (t2.side === s.side) mine += st; else theirs += st;
      });
      if (theirs > mine * 8 && retreatStack(b, s)) { s.done = true; return; }
    }

    // choose target: prefer planet for bombers, weakest effective otherwise
    var hasBombs = s.weapons.some(function (w) { return (w.tech.effect.wclass === 'bomb' || w.tech.effect.wclass === 'bio') && w.shotsLeft > 0; });
    var hasShipWeapons = s.weapons.some(function (w) {
      var wc = w.tech.effect.wclass;
      return wc !== 'bomb' && wc !== 'bio' && w.shotsLeft > 0;
    });
    var target = null;
    if (hasBombs) {
      target = enemies.find(function (e) { return e.planetary; }) || null;
    }
    if (!target || !hasBombs) {
      var bestScore = -1;
      enemies.forEach(function (e) {
        var score = 1000 - cheb(s.x, s.y, e.x, e.y) * 50 - e.shield * 10 + (e.planetary ? -200 : 0);
        if (!hasShipWeapons && !e.planetary) score -= 5000;
        if (score > bestScore) { bestScore = score; target = e; }
      });
    }
    if (!target) { s.done = true; return; }

    // unarmed ships flee to their edge
    if (!s.weapons.length && s.kind === 'ship') {
      retreatStack(b, s);
      s.done = true;
      return;
    }

    // teleport in if possible
    if (s.specials.teleporter && !b.interdictor) {
      var spots = adjacentFree(b, target);
      if (spots.length) { teleportStack(b, s, spots[0].x, spots[0].y); fireAll(b, s, target); s.done = true; return; }
    }

    // move toward target until best weapon in range
    var guard = 0;
    while (!anyWeaponInRange(b, s, target) && s.moved < effSpeed(s) && guard++ < 12) {
      var nx = s.x + Math.sign(target.x - s.x);
      var ny = s.y + Math.sign(target.y - s.y);
      if (nx === s.x && ny === s.y) break;
      if (occupied(b, nx, ny, s)) {
        // try sidestep
        var alts = [[nx, s.y], [s.x, ny], [s.x + Math.sign(target.x - s.x), s.y - 1], [s.x, s.y + 1], [s.x, s.y - 1]];
        var moved = false;
        for (var i = 0; i < alts.length; i++) {
          if (canMoveTo(b, s, alts[i][0], alts[i][1])) { moveStack(b, s, alts[i][0], alts[i][1]); moved = true; break; }
        }
        if (!moved) break;
      } else if (canMoveTo(b, s, nx, ny)) {
        moveStack(b, s, nx, ny);
      } else break;
      if (s.count <= 0) { s.done = true; return; } // died to defensive fire
    }
    if (s.count > 0 && anyWeaponInRange(b, s, target)) fireAll(b, s, target);
    // opportunistic: fire remaining weapons at other in-range enemies
    if (s.count > 0) {
      enemies.forEach(function (e) {
        if (e !== target && e.count > 0) {
          s.weapons.forEach(function (w, wi) {
            if (!w.usedThisRound && w.shotsLeft > 0 && inWeaponRange(b, s, e, w)) fireWeapon(b, s, e, wi);
          });
        }
      });
    }
    s.done = true;
  }

  function adjacentFree(b, t) {
    var out = [];
    for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
      if (!dx && !dy) continue;
      var x = t.x + dx, y = t.y + dy;
      if (x >= 0 && x < COLS && y >= 0 && y < ROWS && !occupied(b, x, y, null)) out.push({ x: x, y: y });
    }
    return out;
  }

  // ---------- auto-resolve entire battle ----------

  function autoResolve(b) {
    var guard = 0;
    while (!b.over && guard++ < 5000) {
      var s = nextStack(b);
      if (!s) break;
      aiAct(b, s);
      checkEnd(b);
    }
    if (!b.over) { b.over = true; b.winner = 1; }
    return b;
  }

  // write battle results back to game state
  function applyResults(g, b) {
    [0, 1].forEach(function (side) {
      var sd = b.sides[side];
      if (sd.monster) {
        var ms = b.stacks.find(function (s) { return s.kind === 'monster'; });
        if (ms) { sd.monster.hits = ms.hits - ms.topDamage; if (ms.count <= 0) sd.monster.hits = 0; }
        return;
      }
      if (!sd.fleets) {
        // bases only
      }
      var emp = g.empires[sd.empId];
      // rebuild fleet ship counts from surviving stacks
      var survivors = [0, 0, 0, 0, 0, 0], retreated = [0, 0, 0, 0, 0, 0];
      b.stacks.forEach(function (s) {
        if (s.side !== side || s.kind !== 'ship') return;
        if (s.retreated) retreated[s.slot] += s.count;
        else survivors[s.slot] += s.count;
      });
      if (sd.fleets && sd.fleets.length) {
        // zero out original fleets, then place survivors
        sd.fleets.forEach(function (f) { f.ships = [0, 0, 0, 0, 0, 0]; });
        var stay = sd.fleets[0];
        stay.ships = survivors.slice();
        if (retreated.some(function (n) { return n > 0; })) {
          // ALL retreaters — winners included — jump to the closest friendly
          // colony other than the battle system (manual: Retreating)
          var nearest = nearestColonyStar(g, emp, b.star);
          if (nearest) {
            var fleeing = {
              id: g.fleetSeq++, empire: emp.id, at: null,
              from: b.star.id, to: nearest.id,
              x: b.star.x, y: b.star.y,
              ships: retreated, retreating: true
            };
            g.fleets.push(fleeing);
          } else {
            // nowhere left to run: the survivors hold at the battle star
            for (var i = 0; i < 6; i++) stay.ships[i] += retreated[i];
          }
        }
      }
      // bases
      var bs = b.stacks.find(function (s) { return s.side === side && s.kind === 'base'; });
      if (bs && b.star.planet.colony && b.star.planet.colony.empire === sd.empId) {
        b.star.planet.colony.bases = bs.count;
      }
    });
    HOO.Fleet.cleanup(g);
  }

  // closest friendly colony OTHER than the battle star, so defenders retreating
  // from their own system actually leave it
  function nearestColonyStar(g, emp, fromStar) {
    var best = null, bd = Infinity;
    HOO.Colony.colonies(g, emp.id).forEach(function (e) {
      if (fromStar && e.star.id === fromStar.id) return;
      var d = U.dist(fromStar.x, fromStar.y, e.star.x, e.star.y);
      if (d < bd) { bd = d; best = e.star; }
    });
    return best;
  }

  // per-design casualty report for the after-action screen
  function casualtySummary(b) {
    var sides = [[], []];
    b.stacks.forEach(function (s) {
      sides[s.side].push({
        name: s.name, kind: s.kind,
        start: s.startCount, left: s.count,
        lost: Math.max(0, s.startCount - s.count),
        // only stacks that actually warped out — mid-retreat stacks stay in
        // orbit as survivors (see applyResults), so don't report them as gone
        retreated: !!s.retreated
      });
    });
    return sides;
  }

  function stackLabel(s) {
    if (s.kind === 'base') return 'Missile bases';
    if (s.kind === 'monster') return s.name;
    var emp = HOO.game.empires[s.empId];
    return (emp ? HOO.DATA.raceById[emp.raceId].adj + ' ' : '') + s.name + (s.count > 1 ? ' ×' + s.count : '');
  }

  function log(b, msg) {
    b.log.push('[' + b.round + '] ' + msg);
    if (b.log.length > 400) b.log.shift();
  }

  HOO.Combat = {
    createBattle: createBattle, autoResolve: autoResolve, applyResults: applyResults,
    nextStack: nextStack, aiAct: aiAct, moveStack: moveStack, canMoveTo: canMoveTo,
    teleportStack: teleportStack, fireAll: fireAll, fireWeapon: fireWeapon,
    retreatStack: retreatStack, checkEnd: checkEnd, alive: alive,
    inWeaponRange: inWeaponRange, anyWeaponInRange: anyWeaponInRange,
    hitNeeded: hitNeeded, cheb: cheb, effSpeed: effSpeed, stackLabel: stackLabel,
    casualtySummary: casualtySummary,
    COLS: COLS, ROWS: ROWS
  };
})();
