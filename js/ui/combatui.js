/* Hamster of Orion — tactical combat view */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var el = U.el;
  var C = function () { return HOO.Combat; };

  var overlay, screenEl, canvas, ctx, logEl, titleEl, btnRow, infoEl;
  var battle, playerSide, current, awaiting, autoMode, onDoneCb, finished;
  var cellW = 72, cellH = 64, pad = 8;
  var hoverCell = null;
  // logical (CSS-pixel) board size; the backing store is this times the device
  // pixel ratio so the tactical grid is not blurry on HiDPI displays
  var boardW = 0, boardH = 0, boardDpr = 1;

  // combat has its own control surface: swallow global hotkeys (Enter, G, 1-6,
  // Tab, Escape...) while the battle overlay is up, since it bypasses HOO.UI's
  // overlay registry and hasOverlay() cannot see it
  function keyBlock(e) {
    // Tab must keep moving focus, or the battle controls are unreachable
    // without a mouse; only Escape is swallowed (a battle cannot be dismissed)
    if (e.key === 'Escape') e.preventDefault();
    e.stopPropagation();
  }

  function isActive() { return !!overlay; }

  function run(b, meta, onDone) {
    battle = b;
    onDoneCb = onDone;
    playerSide = (b.sides[0].empId === 0) ? 0 : 1;
    autoMode = false;
    awaiting = false;
    current = null;
    finished = false;

    overlay = el('div', { cls: 'station-overlay', style: 'z-index:80;' });
    var screen = el('div', { cls: 'combat-screen', style: 'position:relative; width:min(1100px, calc(100vw - 30px)); height:min(780px, calc(100vh - 30px)); border:1px solid var(--line-2); border-radius:8px; overflow:hidden;' });
    screenEl = screen;

    var top = el('div', { cls: 'combat-top' });
    titleEl = el('div', { style: 'font-family:var(--font-display); font-weight:700; letter-spacing:0.06em; text-transform:uppercase;', text: 'Battle of ' + b.star.name });
    top.appendChild(titleEl);
    top.appendChild(el('div', { cls: 'spacer', style: 'flex:1;' }));
    top.appendChild(el('div', { cls: 'stat mono', id: 'combat-current', text: '' }));
    top.appendChild(el('div', { cls: 'stat mono', id: 'combat-round', text: 'Round 1' }));
    screen.appendChild(top);

    var gw = el('div', { cls: 'combat-grid-wrap' });
    canvas = el('canvas', { id: 'combat-canvas' });
    boardW = C().COLS * cellW + pad * 2;
    boardH = C().ROWS * cellH + pad * 2;
    boardDpr = window.devicePixelRatio || 1;
    canvas.width = boardW * boardDpr;
    canvas.height = boardH * boardDpr;
    canvas.style.width = boardW + 'px';
    canvas.style.height = boardH + 'px';
    ctx = canvas.getContext('2d');
    gw.appendChild(canvas);
    screen.appendChild(gw);

    // per-stack readout: acting/hovered stack's hull, shields, initiative...
    infoEl = el('div', { cls: 'mono', style: 'padding:4px 16px; font-size:11px; color:#B7C1D9; min-height:20px; border-top:1px solid var(--line); background:var(--void-2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;' });
    screen.appendChild(infoEl);

    var bottom = el('div', { cls: 'combat-bottom' });
    btnRow = el('div', { style: 'display:flex; gap:6px;' });
    bottom.appendChild(btnRow);
    logEl = el('div', { cls: 'combat-log' });
    bottom.appendChild(logEl);
    screen.appendChild(bottom);

    overlay.appendChild(screen);
    document.body.appendChild(overlay);
    document.addEventListener('keydown', keyBlock, true);

    canvas.addEventListener('click', onClick);
    canvas.addEventListener('mousemove', onHover);

    buildButtons();
    step();
    render();
  }

  function buildButtons() {
    U.clearEl(btnRow);
    btnRow.appendChild(el('button', {
      cls: 'btn small' + (autoMode ? ' active' : ''), text: 'Auto',
      onclick: function () { autoMode = !autoMode; buildButtons(); if (awaiting && autoMode) { actAI(); } }
    }));
    btnRow.appendChild(el('button', {
      cls: 'btn small', text: 'Done',
      onclick: function () { if (awaiting && current) { current.done = true; awaiting = false; step(); } }
    }));
    btnRow.appendChild(el('button', {
      cls: 'btn small', text: 'Missiles',
      title: 'Toggle missile fire for the current stack',
      // only the player's own stack, on its own turn — never enemy/AI stacks
      onclick: function () { if (awaiting && current) { current.missilesOn = !current.missilesOn; log(current.missilesOn ? 'Missiles armed.' : 'Missiles held.'); } }
    }));
    btnRow.appendChild(el('button', {
      cls: 'btn small danger', text: 'Retreat',
      onclick: function () {
        if (awaiting && current) {
          if (C().retreatStack(battle, current)) {
            awaiting = false;
            step();
          } else {
            renderLog(); // e.g. warp dissipator has drained the engines
          }
        }
      }
    }));
  }

  function step() {
    render();
    if (battle.over) { return finish(); }
    var s = C().nextStack(battle);
    render();
    if (!s || battle.over) return finish();
    current = s;
    var roundEl = document.getElementById('combat-round');
    if (roundEl) roundEl.textContent = 'Round ' + battle.round + ' / ' + HOO.CONST.COMBAT_MAX_TURNS;
    var curEl = document.getElementById('combat-current');
    if (curEl) curEl.textContent = (s.side === playerSide ? 'Your move: ' : 'Enemy: ') +
      C().stackLabel(s) + ' — ' + armamentSummary(s);
    setInfo('Now acting (' + (s.side === playerSide ? 'yours' : 'enemy') + '): ' + stackInfo(s));

    if (s.side === playerSide && !autoMode && s.kind !== 'monster') {
      awaiting = true;
      render();
    } else {
      awaiting = false;
      setTimeout(function () {
        C().aiAct(battle, s);
        C().checkEnd(battle);
        renderLog();
        step();
      }, s.side === playerSide ? 60 : 140);
    }
  }

  function actAI() {
    if (!current) return;
    awaiting = false;
    C().aiAct(battle, current);
    C().checkEnd(battle);
    renderLog();
    step();
  }

  function finish() {
    if (finished) return;
    finished = true;
    awaiting = false;
    render();
    renderLog();
    setTimeout(showReport, 700);
  }

  // after-action casualty report: per-design losses on both sides
  function showReport() {
    if (!screenEl) return;
    var sides = C().casualtySummary(battle);
    var playerWon = battle.winner !== null && battle.winner === playerSide;
    var verdict = battle.winner === null ? 'Mutual Annihilation' : (playerWon ? 'Victory' : 'Defeat');
    var box = el('div', { style: 'position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:min(560px, 92%); background:var(--void-2); border:1px solid var(--line-2); border-radius:8px; padding:16px 20px; z-index:5;' });
    box.appendChild(el('div', {
      style: 'font-family:var(--font-display); font-weight:700; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:10px;',
      text: verdict + ' — ' + battle.star.name
    }));
    var cols = el('div', { style: 'display:flex; gap:24px;' });
    [playerSide, 1 - playerSide].forEach(function (side, idx) {
      var col = el('div', { style: 'flex:1; min-width:0;' });
      col.appendChild(el('div', {
        cls: 'mono',
        style: 'font-size:10px; color:#8492AF; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:6px;',
        text: idx === 0 ? 'Your Forces' : 'Enemy Forces'
      }));
      var rows = sides[side];
      if (!rows.length) col.appendChild(el('div', { cls: 'mono', style: 'font-size:11px;', text: '—' }));
      rows.forEach(function (r) {
        var word = r.kind === 'base' ? 'destroyed' : 'lost';
        var txt = r.name + ': ' + r.lost + ' of ' + r.start + ' ' + word;
        if (r.retreated) txt += ', survivors retreated';
        else if (r.left > 0) txt += ', ' + r.left + ' remain';
        col.appendChild(el('div', { cls: 'mono', style: 'font-size:11px; margin-bottom:3px;', text: txt }));
      });
      cols.appendChild(col);
    });
    box.appendChild(cols);
    var row = el('div', { style: 'display:flex; justify-content:flex-end; margin-top:14px;' });
    row.appendChild(el('button', { cls: 'btn', text: 'Continue', onclick: closeOverlay }));
    box.appendChild(row);
    screenEl.appendChild(box);
  }

  // tear down: unhook the hotkey blocker so map shortcuts work again
  function closeOverlay() {
    document.removeEventListener('keydown', keyBlock, true);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null; screenEl = null; canvas = null; ctx = null; logEl = null; infoEl = null;
    current = null; awaiting = false;
    var cb = onDoneCb, b = battle;
    onDoneCb = null; battle = null;
    if (cb) cb(b);
  }

  function armamentSummary(s) {
    if (!s.weapons.length) return 'unarmed';
    return s.weapons.map(function (w) { return w.count + '× ' + w.tech.name; }).join(', ');
  }

  function setInfo(txt) { if (infoEl) infoEl.textContent = txt || ''; }

  // condensed stat line: top ship's hull, stack count, shield class, ECM...
  function stackInfo(s) {
    var top = Math.max(0, Math.ceil(s.hits - s.topDamage));
    var bits = [
      'hull ' + top + '/' + s.hits + (s.count > 1 ? ' (top of ' + s.count + ')' : ''),
      'shield ' + s.shield,
      'ECM ' + (s.ecm || 0),
      'att ' + s.attack,
      'def ' + s.defense,
      'speed ' + C().effSpeed(s),
      'init ' + s.initiative
    ];
    if (s.cloaked) bits.push('cloaked');
    if (s.stasisLeft > 0) bits.push('in stasis');
    if (s.retreating) bits.push('retreating');
    return C().stackLabel(s) + ' — ' + bits.join(' · ');
  }

  // why an attack click on an enemy did nothing
  function cantFireReason(s, t) {
    if (!s.weapons.length) return s.name + ' carries no weapons — it cannot attack.';
    var hasShots = s.weapons.some(function (w) { return w.shotsLeft > 0; });
    if (!hasShots) return s.name + ' has expended all ammunition.';
    var onlyMissiles = s.weapons.every(function (w) {
      return w.shotsLeft <= 0 || w.tech.effect.wclass === 'missile';
    });
    if (onlyMissiles && !s.missilesOn) return 'Missiles are held. Toggle Missiles to fire.';
    var onlyBombs = s.weapons.every(function (w) {
      var wc = w.tech.effect.wclass;
      return w.shotsLeft <= 0 || wc === 'bomb' || wc === 'bio';
    });
    if (onlyBombs && !t.planetary) return 'Bombs can only target the planet.';
    return 'Target out of range. Move closer.';
  }

  // ---------- input ----------
  function cellFromEvent(e) {
    var r = canvas.getBoundingClientRect();
    var sx = boardW / r.width, sy = boardH / r.height;
    var x = Math.floor(((e.clientX - r.left) * sx - pad) / cellW);
    var y = Math.floor(((e.clientY - r.top) * sy - pad) / cellH);
    if (x < 0 || x >= C().COLS || y < 0 || y >= C().ROWS) return null;
    return { x: x, y: y };
  }

  function stackAtCell(x, y) {
    for (var i = 0; i < battle.stacks.length; i++) {
      var s = battle.stacks[i];
      if (s.count > 0 && !s.retreated && s.x === x && s.y === y) return s;
    }
    return null;
  }

  function onHover(e) {
    hoverCell = cellFromEvent(e);
    var t = hoverCell && stackAtCell(hoverCell.x, hoverCell.y);
    canvas.style.cursor = 'default';
    if (awaiting && current && hoverCell) {
      if (t && t.side !== current.side && C().anyWeaponInRange(battle, current, t)) canvas.style.cursor = 'crosshair';
      else if (!t && C().canMoveTo(battle, current, hoverCell.x, hoverCell.y)) canvas.style.cursor = 'pointer';
    }
    // hover readout; falls back to whoever is acting
    if (t) setInfo(stackInfo(t));
    else if (current && !battle.over) setInfo('Now acting (' + (current.side === playerSide ? 'yours' : 'enemy') + '): ' + stackInfo(current));
    render();
  }

  function onClick(e) {
    if (!awaiting || !current) return;
    var cell = cellFromEvent(e);
    if (!cell) return;
    var t = stackAtCell(cell.x, cell.y);
    if (t && t.side !== current.side) {
      if (C().anyWeaponInRange(battle, current, t)) {
        C().fireAll(battle, current, t);
        C().checkEnd(battle);
        renderLog();
        render();
        // after firing all weapons, stack turn ends
        var anyLeft = current.weapons.some(function (w) {
          return !w.usedThisRound && w.shotsLeft > 0;
        });
        if (!anyLeft || battle.over) { current.done = true; awaiting = false; step(); }
      } else {
        log(cantFireReason(current, t));
        renderLog();
      }
    } else if (!t) {
      // teleporter jump anywhere
      if (current.specials.teleporter && !battle.interdictor && current.moved === 0) {
        if (C().teleportStack(battle, current, cell.x, cell.y)) { render(); return; }
      }
      if (C().canMoveTo(battle, current, cell.x, cell.y)) {
        C().moveStack(battle, current, cell.x, cell.y);
        C().checkEnd(battle);
        renderLog();
        if (current.count <= 0 || battle.over) { awaiting = false; step(); }
        render();
      }
    }
  }

  // ---------- rendering ----------
  function render() {
    if (!ctx) return;
    ctx.setTransform(boardDpr, 0, 0, boardDpr, 0, 0);
    ctx.clearRect(0, 0, boardW, boardH);

    // grid
    ctx.strokeStyle = 'rgba(38,49,73,0.7)';
    ctx.lineWidth = 1;
    for (var x = 0; x <= C().COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(pad + x * cellW, pad);
      ctx.lineTo(pad + x * cellW, pad + C().ROWS * cellH);
      ctx.stroke();
    }
    for (var y = 0; y <= C().ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(pad, pad + y * cellH);
      ctx.lineTo(pad + C().COLS * cellW, pad + y * cellH);
      ctx.stroke();
    }

    // reachable cells for current player stack
    if (awaiting && current) {
      for (var cx = 0; cx < C().COLS; cx++) {
        for (var cy = 0; cy < C().ROWS; cy++) {
          if (C().canMoveTo(battle, current, cx, cy)) {
            ctx.fillStyle = 'rgba(107,217,236,0.06)';
            ctx.fillRect(pad + cx * cellW + 1, pad + cy * cellH + 1, cellW - 2, cellH - 2);
          }
        }
      }
    }

    // the world under contention sits on the defender's side; the base stack
    // paints its own planet, so scenery only fills in when no bases remain
    if (battle.star && battle.star.planet) {
      var baseAlive = battle.stacks.some(function (s) { return s.kind === 'base' && s.count > 0 && !s.retreated; });
      if (!baseAlive) drawPlanetScenery();
    }

    // missiles in flight
    battle.missiles.forEach(function (m) {
      var px = pad + m.x * cellW + cellW / 2, py = pad + m.y * cellH + cellH / 2;
      ctx.fillStyle = '#E8635A';
      ctx.beginPath();
      ctx.arc(px + 10, py + 10, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#E8635A88';
      ctx.font = '9px monospace';
      ctx.fillText('×' + m.count, px + 16, py + 14);
    });

    // stacks
    battle.stacks.forEach(function (s) {
      if (s.count <= 0 || s.retreated) return;
      drawStack(s);
    });
  }

  // colony planet drawn in the map's art style (radial gradient disc)
  function drawPlanetScenery() {
    var colony = battle.star.planet.colony;
    var g = HOO.game;
    var color = (colony && g.empires[colony.empire]) ? g.empires[colony.empire].color : '#8492AF';
    var px = pad + (C().COLS - 1) * cellW + cellW / 2;
    var py = pad + Math.floor(C().ROWS / 2) * cellH + cellH / 2 - 6;
    var grad = ctx.createRadialGradient(px, py, 2, px, py, 18);
    grad.addColorStop(0, color);
    grad.addColorStop(1, '#1E2842');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawStack(s) {
    var px = pad + s.x * cellW + cellW / 2;
    var py = pad + s.y * cellH + cellH / 2;
    var g = HOO.game;
    var color = s.kind === 'monster' ? '#E8635A' :
      (s.empId >= 0 ? g.empires[s.empId].color : '#8492AF');

    // current highlight
    if (s === current && !battle.over) {
      ctx.strokeStyle = awaiting ? '#E3B34C' : 'rgba(227,179,76,0.5)';
      ctx.lineWidth = 2;
      ctx.strokeRect(pad + s.x * cellW + 2, pad + s.y * cellH + 2, cellW - 4, cellH - 4);
    }

    ctx.save();
    ctx.translate(px, py - 6);
    if (s.kind === 'base') {
      // planet
      var grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 18);
      grad.addColorStop(0, color);
      grad.addColorStop(1, '#1E2842');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
    } else if (s.kind === 'monster') {
      ctx.font = '26px serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.name.indexOf('Guardian') >= 0 ? '🛸' : '👾', 0, 8);
    } else {
      // ship silhouette scaled by hull
      var szMap = { small: 8, medium: 11, large: 15, huge: 19 };
      var sz = szMap[s.design.hullId] || 10;
      var dir = s.side === 0 ? 1 : -1;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(dir * sz, 0);
      ctx.lineTo(-dir * sz * 0.7, -sz * 0.62);
      ctx.lineTo(-dir * sz * 0.35, 0);
      ctx.lineTo(-dir * sz * 0.7, sz * 0.62);
      ctx.closePath();
      ctx.fill();
      if (s.cloaked) {
        ctx.strokeStyle = 'rgba(169,139,232,0.8)';
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (s.stasisLeft > 0) {
        ctx.strokeStyle = '#6BD9EC';
        ctx.beginPath();
        ctx.arc(0, 0, sz + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // label: wrap long names onto two lines instead of truncating
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E9EEF8';
    ctx.fillText(String(s.count), px, py + 16);
    ctx.fillStyle = '#8492AF';
    ctx.font = '9px "IBM Plex Mono", monospace';
    var nm = s.name;
    if (nm.length > 11) {
      var brk = nm.lastIndexOf(' ', 11);
      if (brk > 2) {
        var rest = nm.slice(brk + 1);
        if (rest.length > 12) rest = rest.slice(0, 11) + '…';
        ctx.fillText(nm.slice(0, brk), px, py + 25);
        ctx.fillText(rest, px, py + 34);
      } else {
        ctx.fillText(nm.slice(0, 10) + '…', px, py + 25);
      }
    } else {
      ctx.fillText(nm, px, py + 25);
    }
    // damage bar on top ship
    if (s.topDamage > 0) {
      var frac = 1 - s.topDamage / s.hits;
      ctx.fillStyle = '#263149';
      ctx.fillRect(px - 16, py - 26, 32, 3);
      ctx.fillStyle = frac > 0.5 ? '#86D992' : '#E8635A';
      ctx.fillRect(px - 16, py - 26, 32 * frac, 3);
    }
  }

  function log(msg) { battle.log.push(msg); renderLog(); }

  function renderLog() {
    if (!logEl) return;
    logEl.innerHTML = battle.log.slice(-4).map(function (l) { return U.esc(l); }).join('<br>');
    logEl.scrollTop = logEl.scrollHeight;
  }

  // forceClose: emergency teardown for fault recovery (main.js rebuild) —
  // removes the capture-phase key blocker and clears all module state without
  // running the completion callback
  function forceClose() {
    document.removeEventListener('keydown', keyBlock, true);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    overlay = null; screenEl = null; canvas = null; ctx = null; logEl = null; infoEl = null;
    current = null; awaiting = false; onDoneCb = null; battle = null;
  }

  // isActive: true while the tactical overlay is up — global hotkey handlers
  // can use it as a guard in addition to the capture-phase key blocker here
  HOO.CombatUI = { run: run, isActive: isActive, forceClose: forceClose };
})();
