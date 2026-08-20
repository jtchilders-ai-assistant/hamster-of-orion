/* Hamster of Orion — tactical combat view */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var el = U.el;
  var C = function () { return HOO.Combat; };

  var overlay, canvas, ctx, logEl, titleEl, btnRow;
  var battle, playerSide, current, awaiting, autoMode, onDoneCb;
  var cellW = 72, cellH = 64, pad = 8;
  var hoverCell = null;

  function run(b, meta, onDone) {
    battle = b;
    onDoneCb = onDone;
    playerSide = (b.sides[0].empId === 0) ? 0 : 1;
    autoMode = false;
    awaiting = false;
    current = null;

    overlay = el('div', { cls: 'station-overlay', style: 'z-index:80;' });
    var screen = el('div', { cls: 'combat-screen', style: 'width:min(1100px, calc(100vw - 30px)); height:min(780px, calc(100vh - 30px)); border:1px solid var(--line-2); border-radius:8px; overflow:hidden;' });

    var top = el('div', { cls: 'combat-top' });
    titleEl = el('div', { style: 'font-family:var(--font-display); font-weight:700; letter-spacing:0.06em; text-transform:uppercase;', text: 'Battle of ' + b.star.name });
    top.appendChild(titleEl);
    top.appendChild(el('div', { cls: 'spacer', style: 'flex:1;' }));
    top.appendChild(el('div', { cls: 'stat mono', id: 'combat-round', text: 'Round 1' }));
    screen.appendChild(top);

    var gw = el('div', { cls: 'combat-grid-wrap' });
    canvas = el('canvas', { id: 'combat-canvas' });
    canvas.width = C().COLS * cellW + pad * 2;
    canvas.height = C().ROWS * cellH + pad * 2;
    ctx = canvas.getContext('2d');
    gw.appendChild(canvas);
    screen.appendChild(gw);

    var bottom = el('div', { cls: 'combat-bottom' });
    btnRow = el('div', { style: 'display:flex; gap:6px;' });
    bottom.appendChild(btnRow);
    logEl = el('div', { cls: 'combat-log' });
    bottom.appendChild(logEl);
    screen.appendChild(bottom);

    overlay.appendChild(screen);
    document.body.appendChild(overlay);

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
      onclick: function () { if (current) { current.missilesOn = !current.missilesOn; log(current.missilesOn ? 'Missiles armed.' : 'Missiles held.'); } }
    }));
    btnRow.appendChild(el('button', {
      cls: 'btn small danger', text: 'Retreat',
      onclick: function () {
        if (awaiting && current) {
          C().retreatStack(battle, current);
          awaiting = false;
          step();
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
    render();
    renderLog();
    setTimeout(function () {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      if (onDoneCb) onDoneCb(battle);
    }, 700);
  }

  // ---------- input ----------
  function cellFromEvent(e) {
    var r = canvas.getBoundingClientRect();
    var sx = canvas.width / r.width, sy = canvas.height / r.height;
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
        log('Target out of range. Move closer.');
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    // label
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#E9EEF8';
    ctx.fillText(String(s.count), px, py + 18);
    ctx.fillStyle = '#8492AF';
    ctx.font = '9px "IBM Plex Mono", monospace';
    var nm = s.name.length > 11 ? s.name.slice(0, 10) + '…' : s.name;
    ctx.fillText(nm, px, py + 28);
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

  HOO.CombatUI = { run: run };
})();
