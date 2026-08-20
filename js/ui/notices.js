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
        opts.buttons = ch.map(function (t) {
          return {
            label: '→ ' + t.name + ' (lv ' + t.level + ')',
            fn: function () { HOO.Research.startProject(emp0, n.tech.cat, t.id); }
          };
        });
        opts.text = n.text + ' Choose our next ' + HOO.CONST.FIELD_NAMES[n.tech.cat] + ' project:';
      }
    }
    HOO.UI.toast(opts);
  }

  // sequentially process turn results, then call done()
  function presentTurn(res, done) {
    var g = HOO.game;
    var queue = [];

    // 1. combats involving the player
    res.playerCombats.forEach(function (pc) {
      queue.push(function (next) { promptCombat(pc, next); });
    });

    // 2. split notices: minor → toast feed, major → modal digest
    var visible = res.notices.filter(function (n) { return !n.ifExplored || g.stars[n.ifExplored].explored[0]; });
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

    // 4. game over check
    queue.push(function (next) {
      if (g.gameOver) gameOverScreen();
      next();
    });

    function runNext() {
      var fn = queue.shift();
      if (!fn) return done();
      fn(runNext);
    }
    runNext();
  }

  // ---------- combat prompt ----------
  function promptCombat(pc, next) {
    var g = HOO.game;
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
      (enemySide.monster ? enemyName : 'the ' + enemyName) + ' (' + theirs + ' units) at ' + U.esc(star.name) + '.</div>',
      [
        {
          label: 'Command the Battle', fn: function () {
            HOO.CombatUI.run(b, pc.meta, function (battle) {
              HOO.Combat.applyResults(g, battle);
              HOO.Turn.afterBattle(g, pc.meta, battle);
              afterPlayerBattle(pc, battle, next);
            });
          }
        },
        {
          label: 'Auto-Resolve', fn: function () {
            HOO.Combat.autoResolve(b);
            HOO.Combat.applyResults(g, b);
            HOO.Turn.afterBattle(g, pc.meta, b);
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
      (b.winner === null ? 'Mutual annihilation over ' + star.name + '.' : 'Defeat. Surviving ships have withdrawn.');
    // offer bombardment if we won over an enemy colony
    var buttons = [{ label: 'Continue', fn: next }];
    if (playerWon && star.planet && star.planet.colony && star.planet.colony.empire !== 0 &&
      HOO.Fleet.fleetAt(g, 0, star.id)) {
      buttons.unshift({
        label: 'Bombard the Colony', cls: 'danger', fn: function () {
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
      var tag = 'Dispatch';
      if (n.type === 'gnn' || n.type === 'event') tag = 'GNN · Galactic News Network';
      else if (n.type === 'discovery') tag = 'Ministry of Science';
      else if (n.type === 'battle') tag = 'Fleet Command';
      else if (n.type === 'spy') tag = 'Intelligence';
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
          cls: 'btn small primary', text: 'Accept',
          onclick: function () {
            var player = g.empires[0];
            if (n.kind === 'peaceOffer') HOO.Diplomacy.makePeace(g, 0, n.empId);
            if (n.kind === 'napOffer') { player.relations[n.empId].treaty = 'nonAggression'; emp.relations[0].treaty = 'nonAggression'; }
            if (n.kind === 'tradeOffer') HOO.Diplomacy.formTrade(g, 0, n.empId, n.amount);
            row.innerHTML = '<span class="good" style="font-size:12px;">Accepted.</span>';
          }
        }));
        row.appendChild(el('button', {
          cls: 'btn small', text: 'Decline',
          onclick: function () {
            HOO.Diplomacy.adjust(g, n.empId, 0, -3, false);
            row.innerHTML = '<span class="muted-t" style="font-size:12px;">Declined.</span>';
          }
        }));
        box.appendChild(row);
      }
      // tech discovery: prompt next research choice if multiple
      if (n.type === 'discovery' && n.tech) {
        var emp0 = g.empires[0];
        var ch = HOO.Research.choices(emp0, n.tech.cat);
        if (ch.length > 1) {
          var row2 = el('div', { style: 'margin-top:8px;' });
          row2.appendChild(el('div', { cls: 'dim-t', style: 'font-size:11px; margin-bottom:4px;', text: 'Direct our next ' + HOO.CONST.FIELD_NAMES[n.tech.cat] + ' project:' }));
          ch.forEach(function (t) {
            row2.appendChild(el('button', {
              cls: 'btn small', style: 'margin:0 4px 4px 0;', text: t.name + ' (lv ' + t.level + ')',
              onclick: function () {
                HOO.Research.startProject(emp0, n.tech.cat, t.id);
                row2.innerHTML = '<span class="good" style="font-size:12px;">Project: ' + U.esc(t.name) + '</span>';
              }
            }));
          });
          box.appendChild(row2);
        }
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
      'More than half the galaxy has been settled. The High Council convenes to elect a Master of Orion. ' +
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
      buttons.push({ label: 'Hear the Votes', fn: function () { finalizeWith(playerIsCandidate ? 0 : null); } });
      if (playerIsCandidate) buttons[0] = { label: 'Hear the Votes', fn: function () { finalizeWith(0); } };
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
              HOO.Council.acceptRuling(g, rec);
              gameOverScreen();
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
              HOO.Council.acceptRuling(g, rec);
              gameOverScreen();
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
    HOO.UI.dialog(title, html, [
      { label: 'Keep Playing', cls: '' },
      { label: 'Main Menu', fn: function () { HOO.UI.closeAll(); HOO.NewGame.showTitle(); } }
    ], true);
  }

  HOO.Notices = { presentTurn: presentTurn, gameOverScreen: gameOverScreen };
})();
