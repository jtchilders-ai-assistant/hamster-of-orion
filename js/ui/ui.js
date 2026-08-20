/* Hamster of Orion — UI framework: frame, modals, widgets */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;
  var el = U.el;

  var app, topbar, alertbar, mapWrap, sidebar, bottombar, canvas, toastStack;

  var SCREEN_KEYS = { Game: 'G', Design: '1', Fleet: '2', Races: '3', Planets: '4', Tech: '5', Status: '6' };

  function buildFrame() {
    app = document.getElementById('app');
    U.clearEl(app);

    var g = HOO.game;
    var player = g.empires[0];

    topbar = el('div', { cls: 'topbar' });
    alertbar = el('div', { cls: 'alertbar' });
    var frame = el('div', { cls: 'frame' });

    canvas = el('canvas', { id: 'galaxy-canvas' });
    toastStack = el('div', { cls: 'toast-stack' });
    mapWrap = el('div', { cls: 'map-wrap' }, [canvas, toastStack]);
    sidebar = el('div', { cls: 'sidebar' });
    var main = el('div', { cls: 'main' }, [mapWrap, sidebar]);

    bottombar = el('div', { cls: 'bottombar' });
    ['Game', 'Design', 'Fleet', 'Races', 'Planets', 'Tech', 'Status'].forEach(function (name) {
      bottombar.appendChild(el('button', {
        cls: 'btn', text: name, title: name + ' (' + SCREEN_KEYS[name] + ')',
        onclick: function () { HOO.Screens.open(name.toLowerCase()); }
      }));
    });
    bottombar.appendChild(el('div', { cls: 'spacer' }));
    var wheelBtn = el('button', {
      cls: 'wheel-btn', id: 'next-turn-btn', title: 'End the cycle (Enter)',
      onclick: function () { HOO.Main.endTurn(); }
    });
    wheelBtn.innerHTML = U.wheelSvg(26, '#E3B34C', 8) + '<span>Turn the Wheel</span>';
    bottombar.appendChild(wheelBtn);

    frame.appendChild(topbar);
    frame.appendChild(alertbar);
    frame.appendChild(main);
    frame.appendChild(bottombar);
    app.appendChild(frame);

    refreshTopbar();
    HOO.Map.init(canvas, mapWrap);
    HOO.Panels.showStar(player.homeStarId);
  }

  // ---------- colony alert bar ----------
  function refreshAlerts() {
    if (!alertbar || !HOO.game) return;
    U.clearEl(alertbar);
    var g = HOO.game;
    var emp = g.empires[0];
    if (emp.dead) return;
    HOO.Colony.colonies(g, 0).forEach(function (e) {
      var c = e.colony, s = e.star;
      var alerts = [];
      if (c.inRebellion) alerts.push({ tag: 'REBELLION', red: true });
      if (c.plague) alerts.push({ tag: 'PLAGUE', red: true });
      if (c.novaThreat) alerts.push({ tag: 'NOVA', red: true });
      if (!c.plague && !c.inRebellion && c.ecoStatus === 'WASTE') alerts.push({ tag: 'WASTE', red: false });
      if (!c.inRebellion && (c.lastGrowth || 0) < -0.5) alerts.push({ tag: 'DECLINE', red: true });
      var totalAlloc = c.alloc.ship + c.alloc.def + c.alloc.ind + c.alloc.eco + c.alloc.tech;
      if (totalAlloc <= 0) alerts.push({ tag: 'IDLE', red: false });
      alerts.forEach(function (a) {
        alertbar.appendChild(el('span', {
          cls: 'alert-chip' + (a.red ? ' red' : ''),
          title: 'Go to ' + s.name,
          onclick: function () {
            HOO.Map.centerOn(s.id);
            HOO.Panels.showStar(s.id);
          }
        }, ['⚠ ' + s.name + ' · ' + a.tag]));
      });
    });
  }

  // ---------- toast feed ----------
  /*
    opts: {tag, text, kind: ''|'gold'|'red'|'green', starId, sticky, buttons:[{label, fn}], timeout}
  */
  function toast(opts) {
    if (!toastStack) return null;
    var t = el('div', { cls: 'toast ' + (opts.kind || '') + (opts.starId !== undefined && opts.starId !== null ? ' link' : '') });
    if (opts.tag) t.appendChild(el('span', { cls: 't-tag', text: opts.tag }));
    t.appendChild(el('div', { html: U.esc(opts.text) }));
    if (opts.buttons && opts.buttons.length) {
      var row = el('div', { style: 'display:flex; gap:4px; margin-top:6px; flex-wrap:wrap;' });
      opts.buttons.forEach(function (b) {
        row.appendChild(el('button', {
          cls: 'btn small', text: b.label,
          onclick: function (ev) {
            if (ev && ev.stopPropagation) ev.stopPropagation();
            if (b.fn) b.fn();
            dismiss();
          }
        }));
      });
      t.appendChild(row);
    }
    var x = el('span', {
      cls: 't-x', text: '×',
      onclick: function (ev) { if (ev && ev.stopPropagation) ev.stopPropagation(); dismiss(); }
    });
    t.appendChild(x);
    if (opts.starId !== undefined && opts.starId !== null) {
      t.addEventListener('click', function () {
        HOO.Map.centerOn(opts.starId);
        HOO.Panels.showStar(opts.starId);
      });
    }
    function dismiss() {
      t.classList.add('fadeout');
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 500);
    }
    toastStack.appendChild(t);
    // cap the stack
    while (toastStack.children.length > 7) toastStack.removeChild(toastStack.firstChild);
    if (!opts.sticky && !(opts.buttons && opts.buttons.length)) {
      setTimeout(dismiss, opts.timeout || 14000);
    }
    return t;
  }

  function clearToasts() { if (toastStack) U.clearEl(toastStack); }

  function refreshTopbar() {
    var g = HOO.game;
    var player = g.empires[0];
    var race = HOO.DATA.raceById[player.raceId];
    U.clearEl(topbar);
    var brand = el('div', { cls: 'brand' });
    brand.innerHTML = U.wheelSvg(20, '#E3B34C', 8) + '<span>Hamster <span class="of">of</span> Orion</span>';
    topbar.appendChild(brand);
    topbar.appendChild(el('div', { cls: 'stat', html: 'CYCLE <b>' + g.year + '</b>' }));
    topbar.appendChild(el('div', { cls: 'stat', html: race.glyph + ' <b>' + U.esc(race.name) + '</b> · ' + U.esc(player.leaderName) }));
    topbar.appendChild(el('div', { cls: 'spacer' }));
    var eco = player.economy;
    if (eco) topbar.appendChild(el('div', { cls: 'stat', html: 'PRODUCTION <b>' + U.fmt(eco.total) + '</b> BC' }));
    topbar.appendChild(el('div', { cls: 'stat', html: 'RESERVE <b>' + U.fmt(player.reserve) + '</b> BC' }));
    var fr = HOO.Council.colonizedFraction(g);
    topbar.appendChild(el('div', { cls: 'stat', html: 'GALAXY <b>' + Math.round(fr * 100) + '%</b> settled' }));
    refreshAlerts();
  }

  function sidebarEl() { return sidebar; }
  function mapWrapEl() { return mapWrap; }

  // ---------- modal helpers ----------
  var overlays = [];

  function modal(contentEl, opts) {
    opts = opts || {};
    var ov = el('div', { cls: 'station-overlay' });
    var station = el('div', { cls: 'station', style: opts.width ? ('width:min(' + opts.width + 'px, calc(100vw - 40px))') : '' });
    if (opts.title) {
      var head = el('div', { cls: 'station-head' }, [
        el('h1', { text: opts.title }),
        el('div', { cls: 'spacer' })
      ]);
      if (opts.headerExtra) head.insertBefore(opts.headerExtra, head.lastChild);
      if (!opts.noClose) head.appendChild(el('button', { cls: 'btn small', text: 'Close', onclick: function () { close(ov); } }));
      station.appendChild(head);
    }
    var body = el('div', { cls: 'station-body' }, [contentEl]);
    station.appendChild(body);
    ov.appendChild(station);
    if (!opts.noClose) {
      ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(ov); });
    }
    document.body.appendChild(ov);
    overlays.push(ov);
    return ov;
  }

  function close(ov) {
    if (!ov) ov = overlays[overlays.length - 1];
    if (!ov) return;
    var i = overlays.indexOf(ov);
    if (i >= 0) overlays.splice(i, 1);
    if (ov.parentNode) ov.parentNode.removeChild(ov);
  }

  function closeAll() { while (overlays.length) close(); }

  function hasOverlay() { return overlays.length > 0; }

  // simple confirm/choice dialog; buttons: [{label, cls, fn}]
  function dialog(title, html, buttons, noClose) {
    var content = el('div', {});
    if (typeof html === 'string') content.appendChild(el('div', { html: html }));
    else content.appendChild(html);
    var row = el('div', { style: 'display:flex; gap:8px; margin-top:16px; flex-wrap:wrap;' });
    var ov;
    (buttons || [{ label: 'Continue' }]).forEach(function (b) {
      row.appendChild(el('button', {
        cls: 'btn ' + (b.cls || 'primary'),
        text: b.label,
        onclick: function () { close(ov); if (b.fn) b.fn(); }
      }));
    });
    content.appendChild(row);
    ov = modal(content, { title: title, width: 560, noClose: noClose });
    return ov;
  }

  // ---------- ratio bar widget ----------
  /*
    opts: {label, cls, get():pct, set(pct), note():string, lockable, locked(), toggleLock()}
  */
  function ratioRow(opts) {
    var row = el('div', { cls: 'ratio-row ' + (opts.cls || '') });
    var label = el('div', {
      cls: 'ratio-label', text: opts.label,
      onclick: function () {
        if (opts.lockable && opts.toggleLock) { opts.toggleLock(); update(); }
      }
    });
    var bar = el('div', { cls: 'ratio-bar' });
    var fill = el('div', { cls: 'ratio-fill' });
    bar.appendChild(fill);
    var note = el('div', { cls: 'ratio-note' });

    function pctFromEvent(e) {
      var r = bar.getBoundingClientRect();
      return U.clamp(Math.round((e.clientX - r.left) / r.width * 100), 0, 100);
    }
    var dragging = false;
    bar.addEventListener('mousedown', function (e) {
      if (opts.locked && opts.locked()) return;
      dragging = true;
      opts.set(pctFromEvent(e));
      update();
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      opts.set(pctFromEvent(e));
      update();
    });
    window.addEventListener('mouseup', function () { dragging = false; });

    function update() {
      var v = opts.get();
      fill.style.width = v + '%';
      note.textContent = opts.note ? opts.note() : (Math.round(v) + '%');
      var isLocked = opts.locked && opts.locked();
      row.classList.toggle('locked', !!isLocked);
      label.classList.toggle('locked', !!isLocked);
      if (opts.onUpdate) opts.onUpdate();
    }
    row.appendChild(label);
    row.appendChild(bar);
    row.appendChild(note);
    row._update = update;
    update();
    return row;
  }

  // rebalance an allocation object so keys sum to 100, respecting locks
  function rebalance(alloc, changedKey, newVal, locks) {
    var keys = Object.keys(alloc);
    var lockedSum = 0;
    keys.forEach(function (k) { if (locks[k] && k !== changedKey) lockedSum += alloc[k]; });
    newVal = U.clamp(newVal, 0, 100 - lockedSum);
    alloc[changedKey] = newVal;
    var freeKeys = keys.filter(function (k) { return k !== changedKey && !locks[k]; });
    var remaining = 100 - lockedSum - newVal;
    var currentFree = 0;
    freeKeys.forEach(function (k) { currentFree += alloc[k]; });
    if (freeKeys.length === 0) return;
    if (currentFree <= 0) {
      var each = remaining / freeKeys.length;
      freeKeys.forEach(function (k) { alloc[k] = each; });
    } else {
      freeKeys.forEach(function (k) { alloc[k] = alloc[k] / currentFree * remaining; });
    }
    // round while preserving sum
    var sum = 0;
    keys.forEach(function (k) { alloc[k] = Math.round(alloc[k]); sum += alloc[k]; });
    var diff = 100 - sum;
    for (var i = 0; i < keys.length && diff !== 0; i++) {
      var k2 = freeKeys.length ? freeKeys[i % freeKeys.length] : changedKey;
      alloc[k2] += diff > 0 ? 1 : -1;
      diff += diff > 0 ? -1 : 1;
    }
  }

  function setWheelSpinning(on) {
    var b = document.getElementById('next-turn-btn');
    if (b) { b.classList.toggle('spinning', on); b.disabled = on; }
  }

  HOO.UI = {
    buildFrame: buildFrame, refreshTopbar: refreshTopbar, refreshAlerts: refreshAlerts,
    sidebarEl: sidebarEl, mapWrapEl: mapWrapEl,
    modal: modal, close: close, closeAll: closeAll, hasOverlay: hasOverlay, dialog: dialog,
    toast: toast, clearToasts: clearToasts,
    ratioRow: ratioRow, rebalance: rebalance, setWheelSpinning: setWheelSpinning
  };
})();
