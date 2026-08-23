/* Hamster of Orion — turn results: notices, combat prompts, council, game over */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var el = U.el;

  // notice types that stay quiet (toast feed); everything else interrupts with a modal
  var MINOR_TYPES = { explore: 1, spy: 1, info: 1, built: 1, eco: 1, bad: 1, discovery: 1 };

  function toastKindFor(n) {
    if (n.type === 'discovery') return 'gold';
    if (n.type === 'bad' || n.good === false) return 'red';
    if (n.type === 'built' || n.type === 'eco') return 'green';
    return '';
  }

  function tagFor(n) {
    if (n.type === 'discovery') return 'Ministry of Science';
    if (n.type === 'spy') return 'Intelligence';
    if (n.type === 'explore') return 'Survey Corps';
    if (n.type === 'built' || n.type === 'eco') return 'Colonial Administration';
    return 'Dispatch';
  }

  function toastMinor(n) {
    var g = HOO.game;
    var opts = {
      tag: tagFor(n), text: n.text, kind: toastKindFor(n),
      starId: n.starId, timeout: 16000
    };
    // discovery with a research choice: sticky toast with inline buttons
    if (n.type === 'discovery' && n.tech) {
      var emp0 = g.empires[0];
      var ch = HOO.Research.choices(emp0, n.tech.cat);
      if (ch.length > 1) {
        opts.sticky = true;
        // one standing offer per field: a newer discovery supersedes the older
        // prompt rather than stacking a second, stale one beside it
        opts.key = 'research:' + n.tech.cat;
        opts.buttons = ch.map(function (t) {
          return {
            label: '→ ' + t.name + ' (lv ' + t.level + ')',
            fn: function () {
              // the offer may have gone stale (tech since acquired by theft,
              // trade or conquest) — only act if it is still a live choice
              var live = HOO.Research.choices(emp0, n.tech.cat);
              for (var i = 0; i < live.length; i++) {
                if (live[i].id === t.id) { HOO.Research.startProject(emp0, n.tech.cat, t.id); return; }
              }
            }
          };
        });
        opts.text = n.text + ' Choose our next ' + HOO.CONST.FIELD_NAMES[n.tech.cat] + ' project:';
      }
    }
    HOO.UI.toast(opts);
    // eco-tech breakthrough: offer to put the new capability to work at once
    var ECO_TECH = { terraform: 1, soil: 1, advSoil: 1, atmos: 1 };
    if (n.type === 'discovery' && n.tech && n.tech.effect && ECO_TECH[n.tech.effect.type]) {
      offerEcoBoost(n.tech);
    }
  }

  // a new ecology technology (terraforming, soil enrichment, atmospheric
  // conversion) opens projects on existing worlds — offer a one-click Eco
  // boost. Each boosted colony hands the extra allocation back to research
  // automatically when its ecology projects finish (colony.js applyEcoBoost).
  function offerEcoBoost(tech) {
    var g = HOO.game;
    var emp0 = g.empires[0];
    var open = HOO.Colony.colonies(g, 0).filter(function (e) {
      return !e.colony.inRebellion && !(e.colony.locks && e.colony.locks.eco) &&
        HOO.Colony.ecoWorkRemaining(emp0, e.star);
    }).length;
    if (!open) return;
    function apply(pct) {
      return function () {
        var boosted = HOO.Colony.applyEcoBoost(g, emp0, pct);
        HOO.UI.toast({
          tag: 'Colonial Administration', kind: 'green', timeout: 9000,
          text: 'Eco allocation raised on ' + boosted + (boosted === 1 ? ' world' : ' worlds') + '. Each returns the boost to research when its projects are done.'
        });
        // re-render the sidebar if a colony's bars are on display
        var sel = HOO.Map.getSelected();
        if (sel && sel.star !== null && sel.star !== undefined) HOO.Panels.showStar(sel.star);
      };
    }
    HOO.UI.toast({
      tag: 'Colonial Administration', kind: 'green', sticky: true, key: 'ecoboost',
      text: tech.name + ' opens ecology projects on ' + open + (open === 1 ? ' world' : ' worlds') + '. Raise Eco spending to begin the work? (Drawn from tech, then industry, bases and ships; returned to research on completion.)',
      buttons: [
        { label: '+10% Eco', fn: apply(10) },
        { label: '+25% Eco', fn: apply(25) },
        { label: 'Not Now' }
      ]
    });
  }

  // session message log — dismissed toasts and digests can be re-read from
  // the Game menu (Message Log). Not serialized; it lives with the session.
  var history = [];
  function getHistory() { return history; }
  // a new or loaded game starts a new chronicle — the previous empire's
  // dispatches must not surface in its Message Log
  function resetHistory() { history.length = 0; }

  // sequentially process turn results, then call done()
  function presentTurn(res, done) {
    var g = HOO.game;
    var queue = [];

    // 1. combats involving the player
    res.playerCombats.forEach(function (pc) {
      queue.push(function (next) { promptCombat(pc, next); });
    });

    // 2. split notices: minor → toast feed, major → modal digest
    // (== null: star id 0 is a legitimate ifExplored value)
    var visible = res.notices.filter(function (n) { return n.ifExplored == null || g.stars[n.ifExplored].explored[0]; });
    visible.forEach(function (n) {
      history.push({ year: g.year, type: n.type, name: n.name, text: n.text });
    });
    if (history.length > 400) history.splice(0, history.length - 400);
    var minor = visible.filter(function (n) { return MINOR_TYPES[n.type]; });
    var interesting = visible.filter(function (n) { return !MINOR_TYPES[n.type]; });
    minor.forEach(toastMinor);
    if (interesting.length) {
      queue.push(function (next) { noticesDigest(interesting, next); });
    }

    // 3. council
    if (res.council) {
      queue.push(function (next) { councilSession(res.council, next); });
    }

    // 4. game over check (once — a player who chose to keep playing after the
    // verdict must not be shown it again every cycle)
    queue.push(function (next) {
      if (g.gameOver && !g.gameOver.acknowledged) gameOverScreen();
      next();
    });

    function runNext() {
      var fn = queue.shift();
      if (!fn) return done();
      fn(runNext);
    }
    runNext();
  }

  // notices pushed into g.notices during afterBattle (monster outcomes,
  // deferred landings, guardian falls) arrive after presentTurn's snapshot —
  // surface them as dispatches and log them so they aren't silently lost
  function drainLateNotices(g, fromLen) {
    var fresh = g.notices.slice(fromLen);
    fresh.forEach(function (n) {
      if (n.ifExplored != null && !g.stars[n.ifExplored].explored[0]) return;
      history.push({ year: g.year, type: n.type, name: n.name, text: n.text });
      toastMinor(n);
    });
    if (history.length > 400) history.splice(0, history.length - 400);
  }

  // ---------- combat prompt ----------
  function promptCombat(pc, next) {
    var g = HOO.game;
    // Battles were built during turn processing, but anything resolved since
    // then (an AI-vs-AI fight at the same star, or an earlier prompt in this
    // same queue) has already changed the fleets and bases those stacks were
    // snapshotted from. Rebuild from live state so a second battle at one star
    // cannot resurrect losses from the first. Monster sieges carry their own
    // pre-built battle and have no buildBattle descriptor.
    if (!pc.meta.monsterEvent) {
      var fresh = HOO.Turn.buildBattle(g, pc.meta);
      if (!fresh) return next(); // the fight no longer exists
      pc.battle = fresh;
    }
    var b = pc.battle;
    var star = b.star;
    var enemySide = b.sides[0].empId === 0 ? b.sides[1] : b.sides[0];
    var enemyName = enemySide.monster ? enemySide.monster.name :
      HOO.DATA.raceById[g.empires[enemySide.empId].raceId].name;

    var mine = 0, theirs = 0;
    b.stacks.forEach(function (s) {
      var isMine = (b.sides[s.side].empId === 0);
      if (isMine) mine += s.count; else theirs += s.count;
    });

    HOO.UI.dialog('Battle at ' + star.name,
      '<div class="narrative"><span class="speaker">Fleet Command</span>Our forces (' + mine + ' units) have engaged ' +
      (enemySide.monster ? U.esc(enemyName) : 'the ' + U.esc(enemyName)) + ' (' + theirs + ' units) at ' + U.esc(star.name) + '.</div>',
      [
        {
          label: 'Command the Battle', fn: function () {
            HOO.CombatUI.run(b, pc.meta, function (battle) {
              HOO.Combat.applyResults(g, battle);
              var nlen = g.notices.length;
              HOO.Turn.afterBattle(g, pc.meta, battle);
              drainLateNotices(g, nlen);
              afterPlayerBattle(pc, battle, next);
            });
          }
        },
        {
          label: 'Auto-Resolve', fn: function () {
            HOO.Combat.autoResolve(b);
            HOO.Combat.applyResults(g, b);
            var nlen = g.notices.length;
            HOO.Turn.afterBattle(g, pc.meta, b);
            drainLateNotices(g, nlen);
            afterPlayerBattle(pc, b, next);
          }
        }
      ], true);
  }

  function afterPlayerBattle(pc, b, next) {
    var g = HOO.game;
    var star = b.star;
    var playerWon = b.winner !== null && b.sides[b.winner] && b.sides[b.winner].empId === 0;
    var summary = playerWon ? 'Victory. The system is ours to command.' :
      (b.winner === null ? 'Mutual annihilation over ' + U.esc(star.name) + '.' : 'Defeat. Surviving ships have withdrawn.');
    // offer bombardment if we won over an enemy colony and have bombs available
    var buttons = [{ label: 'Continue', fn: next }];
    if (playerWon && star.planet && star.planet.colony && star.planet.colony.empire !== 0 &&
      HOO.Ground.canBombard(g, 0, star)) {
      var f0 = HOO.Fleet.fleetAt(g, 0, star.id);
      var bCount = HOO.Ground.fleetBombs(g.empires[0], f0);
      buttons.unshift({
        label: 'Bombard Colony (' + bCount + (bCount === 1 ? ' bomb' : ' bombs') + ')', cls: 'danger', fn: function () {
          var rep = HOO.Ground.bombard(g, 0, star);
          var txt = rep ? ('Bombardment of ' + U.esc(star.name) + ': ' + Math.round(rep.popKilled) + ' million dead, ' + Math.round(rep.factoriesLost) + ' factories destroyed.' + (rep.destroyed ? ' The colony is no more.' : '')) : 'No effective ordnance.';
          HOO.UI.dialog('Bombardment Report', txt, [{ label: 'Continue', fn: next }], true);
        }
      });
    }
    HOO.UI.dialog('After Action — ' + star.name, summary, buttons, true);
  }

  // ---------- notices digest ----------
  function noticesDigest(notices, next) {
    var g = HOO.game;
    var content = el('div', {});
    var handlers = [];

    notices.forEach(function (n) {
      var box = el('div', { cls: 'gnn' });
      // (discovery/spy notices are MINOR_TYPES and never reach the digest;
      // their interactive handling lives in toastMinor)
      var tag = 'Dispatch';
      if (n.type === 'gnn' || n.type === 'event') tag = 'GNN · Galactic News Network';
      else if (n.type === 'battle') tag = 'Fleet Command';
      else if (n.type === 'contact') tag = 'First Contact';
      else if (n.type === 'diplomacy') tag = 'Diplomatic Courier';
      else if (n.type === 'war') tag = 'GNN · War Report';
      box.appendChild(el('span', { cls: 'gnn-tag', text: tag + (n.name ? ' — ' + n.name : '') }));
      box.appendChild(el('div', { style: 'font-size:13.5px;', html: U.esc(n.text) }));
      if (n.starId !== undefined && n.starId !== null) {
        box.appendChild(el('button', {
          cls: 'btn small', style: 'margin-top:6px;', text: 'Go to System',
          onclick: function () {
            HOO.UI.closeAll();
            HOO.Map.centerOn(n.starId);
            HOO.Panels.showStar(n.starId);
            next();
          }
        }));
      }

      // actionable diplomacy offers
      if (n.type === 'diplomacy' && n.kind && n.empId !== undefined) {
        var row = el('div', { style: 'display:flex; gap:6px; margin-top:8px;' });
        var emp = g.empires[n.empId];
        row.appendChild(el('button', {
          cls: 'btn small primary', text: n.kind === 'tributeDemand' ? 'Pay' : 'Accept',
          onclick: function () {
            var player = g.empires[0];
            if (n.kind === 'peaceOffer') HOO.Diplomacy.makePeace(g, 0, n.empId);
            if (n.kind === 'napOffer') { player.relations[n.empId].treaty = 'nonAggression'; emp.relations[0].treaty = 'nonAggression'; }
            if (n.kind === 'allianceOffer') { player.relations[n.empId].treaty = 'alliance'; emp.relations[0].treaty = 'alliance'; }
            if (n.kind === 'tradeOffer') HOO.Diplomacy.formTrade(g, 0, n.empId, n.amount);
            if (n.kind === 'tributeDemand') {
              // pay what the treasury can actually cover; paying soothes them
              HOO.Diplomacy.offerTribute(g, 0, n.empId, Math.min(n.amount, Math.max(0, Math.floor(player.reserve))));
              HOO.UI.refreshTopbar();
            }
            row.innerHTML = '<span class="good" style="font-size:12px;">' + (n.kind === 'tributeDemand' ? 'Paid.' : 'Accepted.') + '</span>';
          }
        }));
        row.appendChild(el('button', {
          cls: 'btn small', text: n.kind === 'tributeDemand' ? 'Refuse' : 'Decline',
          onclick: function () {
            // refusing a tribute demand stings far more than declining an offer
            if (n.kind === 'tributeDemand') HOO.Diplomacy.adjust(g, n.empId, 0, -8, true);
            else HOO.Diplomacy.adjust(g, n.empId, 0, -3, false);
            row.innerHTML = '<span class="muted-t" style="font-size:12px;">' + (n.kind === 'tributeDemand' ? 'Refused.' : 'Declined.') + '</span>';
          }
        }));
        box.appendChild(row);
      }
      content.appendChild(box);
    });

    var doneBtn = el('button', {
      cls: 'btn primary', style: 'margin-top:6px;', text: 'To the Bridge',
      onclick: function () { HOO.UI.closeAll(); next(); }
    });
    content.appendChild(doneBtn);
    HOO.UI.modal(content, { title: 'Cycle ' + HOO.game.year + ' — Reports', width: 700, noClose: true });
  }

  // ---------- council ----------
  function councilSession(record, next) {
    var g = HOO.game;
    var player = g.empires[0];
    var c0 = g.empires[record.candidates[0]], c1 = g.empires[record.candidates[1]];
    var playerIsCandidate = record.candidates.indexOf(0) >= 0;

    function nameOf(emp) { return HOO.DATA.raceById[emp.raceId].name; }

    var needTxt = Math.ceil(record.totalVotes * 2 / 3) + ' of ' + record.totalVotes + ' votes';
    var intro = '<div class="narrative"><span class="speaker">The High Council</span>' +
      'Two-thirds of the galaxy has been settled. The High Council convenes to elect a Master of Orion. ' +
      'The candidates: the <b>' + nameOf(c0) + '</b> and the <b>' + nameOf(c1) + '</b>. ' +
      'A two-thirds majority of ' + needTxt + ' is required.</div>';

    // build vote display later; first, player votes (if not auto-assigned)
    var needChoice = record.votes[0] && record.votes[0].choice === 'PLAYER_CHOICE';
    var buttons = [];
    function finalizeWith(choice) {
      var rec = HOO.Council.finalize(g, record, choice);
      showResults(rec);
    }
    if (needChoice) {
      buttons.push({ label: 'Vote — ' + nameOf(c0), fn: function () { finalizeWith(c0.id); } });
      buttons.push({ label: 'Vote — ' + nameOf(c1), fn: function () { finalizeWith(c1.id); } });
      buttons.push({ label: 'Abstain', cls: '', fn: function () { finalizeWith(null); } });
    } else {
      // only reachable if the player has no vote record (e.g. eliminated mid-council)
      buttons.push({ label: 'Hear the Votes', fn: function () { finalizeWith(null); } });
    }

    HOO.UI.dialog('The High Council Convenes', intro + '<div class="muted-t" style="font-size:12px;">Your delegation carries ' + record.votes[0].votes + ' vote(s).</div>', buttons, true);

    function showResults(rec) {
      var html = '';
      g.empires.forEach(function (emp) {
        if (emp.dead || !rec.votes[emp.id]) return;
        var v = rec.votes[emp.id];
        var choiceName = v.choice === null || v.choice === undefined ? 'abstains' :
          ('votes for the ' + nameOf(g.empires[v.choice]));
        html += '<div class="kv"><span class="k">' + nameOf(emp) + ' (' + v.votes + ')</span><span class="v">' + choiceName + '</span></div>';
      });
      html += '<hr class="hr">';
      html += '<div class="kv"><span class="k">' + nameOf(c0) + '</span><span class="v">' + (rec.totals[c0.id] || 0) + ' votes</span></div>';
      html += '<div class="kv"><span class="k">' + nameOf(c1) + '</span><span class="v">' + (rec.totals[c1.id] || 0) + ' votes</span></div>';
      html += '<div class="kv"><span class="k">Required</span><span class="v">' + rec.needed + '</span></div>';

      if (rec.winner === null) {
        html += '<div class="narrative" style="margin-top:10px;"><span class="speaker">The High Council</span>No candidate commands two-thirds of the galaxy. The Council adjourns. The struggle continues.</div>';
        HOO.UI.dialog('The Council Adjourns', html, [{ label: 'Continue', fn: next }], true);
        return;
      }

      var winnerEmp = g.empires[rec.winner];
      if (rec.winner === 0) {
        html += '<div class="narrative" style="margin-top:10px;"><span class="speaker">The High Council</span>By the will of the assembled races, the ' + nameOf(player) + ' are declared <b>Masters of Orion</b>.</div>';
        HOO.UI.dialog('A Verdict Is Reached', html, [
          {
            label: 'Accept — Claim the Wheel', fn: function () {
              // acceptRuling sets g.gameOver; the queue's final step presents
              // the game-over screen, so calling it here too would stack a
              // duplicate dialog on the climax of the game
              HOO.Council.acceptRuling(g, rec);
              next();
            }
          },
          {
            label: 'Decline the Throne', cls: '', fn: next
          }
        ], true);
      } else {
        html += '<div class="narrative" style="margin-top:10px;"><span class="speaker">The High Council</span>The ' + nameOf(winnerEmp) + ' are declared Masters of Orion. All races must swear fealty… or be cast out.</div>';
        HOO.UI.dialog('A Verdict Is Reached', html, [
          {
            label: 'Accept Their Rule (Defeat)', cls: '', fn: function () {
              // see above — the queue's game-over step presents this once
              HOO.Council.acceptRuling(g, rec);
              next();
            }
          },
          {
            label: 'REJECT — Defy the Galaxy', cls: 'danger', fn: function () {
              HOO.Council.rejectRuling(g, 0);
              HOO.UI.dialog('The Final War',
                '<div class="narrative"><span class="speaker">' + U.esc(player.leaderName) + '</span>We did not crawl from the habitrails of our ancestors to kneel. Let them come. All of them.</div>' +
                '<p class="bad" style="margin-top:8px;">Every remaining empire has united against you. Victory now demands the extermination of all rivals.</p>',
                [{ label: 'So Be It', fn: next }], true);
            }
          }
        ], true);
      }
    }
  }

  // ---------- game over ----------
  function gameOverScreen() {
    var g = HOO.game;
    var go = g.gameOver;
    if (!go) return;
    var player = g.empires[0];
    var race = HOO.DATA.raceById[player.raceId];
    var html, title;
    if (go.victory === 'diplomatic') {
      title = 'MASTER OF ORION';
      html = '<div class="narrative"><span class="speaker">The Chronicles</span>By word and treaty, by patience and cunning, the ' + race.name + ' have been raised above all races. The Cosmic Wheel turns for ' + U.esc(player.leaderName) + ' now — and the galaxy runs willingly within it.</div>';
    } else if (go.victory === 'domination') {
      title = 'MASTER OF ORION';
      html = '<div class="narrative"><span class="speaker">The Chronicles</span>In the silence of a conquered galaxy, there can be no argument about who rules. The ' + race.name + ' stand alone among the stars. The Wheel is theirs.</div>';
    } else {
      title = 'THE WHEEL TURNS WITHOUT YOU';
      var winnerTxt = (go.winner !== undefined && go.winner !== null && g.empires[go.winner]) ?
        'The ' + HOO.DATA.raceById[g.empires[go.winner].raceId].name + ' claim the galaxy.' :
        'Your empire has fallen.';
      html = '<div class="narrative"><span class="speaker">The Chronicles</span>' + winnerTxt + ' The long memory of the ' + race.name + ' ends here — another name carved into the ruins for some future race to puzzle over.</div>';
    }
    html += '<p class="muted-t" style="margin-top:10px;">Cycle ' + g.year + ' · ' + (g.year - HOO.CONST.START_YEAR) + ' years of rule</p>';
    var buttons = [];
    // an eliminated empire has nothing left to play on with — offering
    // "Keep Playing" there just re-summons this dialog on every Enter
    if (go.how !== 'eliminated') {
      buttons.push({
        label: 'Keep Playing', cls: '',
        // remember the verdict was seen so the end of every later cycle does
        // not re-open this dialog for the rest of the session
        fn: function () { go.acknowledged = true; }
      });
    }
    buttons.push({ label: 'Main Menu', fn: function () { HOO.UI.closeAll(); HOO.NewGame.showTitle(); } });
    HOO.UI.dialog(title, html, buttons, true);
  }

  HOO.Notices = {
    presentTurn: presentTurn, gameOverScreen: gameOverScreen,
    getHistory: getHistory, resetHistory: resetHistory
  };
})();
