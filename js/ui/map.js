/* Hamster of Orion — galaxy map canvas */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';
  var U = HOO.util;

  var canvas, ctx, wrap;
  var view = { x: 0, y: 0, scale: 1 };
  var selectedStar = null, selectedFleet = null;
  var deployMode = null;   // legacy explicit mode (kept for API compat)
  var transportMode = null; // {fromStarId, pop}
  var relocMode = null;    // {starId}
  var hoverTip = null, hoverStar = null;
  var banner = null;
  var pulse = 0;
  var starfield = null;

  function init(cv, wrapEl) {
    canvas = cv; wrap = wrapEl;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    fitView();

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('mouseleave', function () { hideTip(); dragging = null; });

    requestAnimationFrame(tick);
  }

  function resize() {
    if (!canvas.parentNode) return;
    var r = wrap.getBoundingClientRect();
    canvas.width = r.width * (window.devicePixelRatio || 1);
    canvas.height = r.height * (window.devicePixelRatio || 1);
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
  }

  function fitView() {
    var g = HOO.game;
    var r = wrap.getBoundingClientRect();
    var sx = r.width / g.w, sy = r.height / g.h;
    view.scale = Math.min(sx, sy) * 0.95;
    view.x = (g.w - r.width / view.scale) / 2;
    view.y = (g.h - r.height / view.scale) / 2;
  }

  function w2s(x, y) { // world to screen (css px)
    return { x: (x - view.x) * view.scale, y: (y - view.y) * view.scale };
  }
  function s2w(x, y) {
    return { x: x / view.scale + view.x, y: y / view.scale + view.y };
  }

  // ---------- interactions ----------
  var dragging = null;

  function starAt(wx, wy) {
    var g = HOO.game, best = null, bd = 14 / view.scale;
    g.stars.forEach(function (s) {
      var d = U.dist(wx, wy, s.x, s.y);
      if (d < bd) { bd = d; best = s; }
    });
    return best;
  }

  function fleetAt(wx, wy) {
    var g = HOO.game, best = null, bd = 10 / view.scale;
    g.fleets.forEach(function (f) {
      var pos = fleetDrawPos(f);
      var d = U.dist(wx, wy, pos.x, pos.y);
      if (d < bd) { bd = d; best = f; }
    });
    return best;
  }

  function fleetDrawPos(f) {
    var g = HOO.game;
    if (f.at !== null) {
      var s = g.stars[f.at];
      var idx = HOO.Fleet.fleetsAt(g, f.at).indexOf(f);
      return { x: s.x + 14, y: s.y - 10 + idx * 9 };
    }
    return { x: f.x, y: f.y };
  }

  function onDown(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    dragging = { sx: mx, sy: my, vx: view.x, vy: view.y, moved: false };
  }

  function onMove(e) {
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    if (dragging) {
      var dx = (mx - dragging.sx) / view.scale, dy = (my - dragging.sy) / view.scale;
      if (Math.abs(mx - dragging.sx) + Math.abs(my - dragging.sy) > 4) dragging.moved = true;
      if (dragging.moved) { view.x = dragging.vx - dx; view.y = dragging.vy - dy; }
      return;
    }
    var w = s2w(mx, my);
    var s = starAt(w.x, w.y);
    hoverStar = s;
    var f = !s && fleetAt(w.x, w.y);
    if (s) showTipStar(s, mx, my);
    else if (f) showTipFleet(f, mx, my);
    else hideTip();
    var ordering = transportMode || relocMode || orderableFleet();
    canvas.style.cursor = ordering && s ? 'crosshair' : ((s || f) ? 'pointer' : 'default');
  }

  // the currently selected own fleet that can take a movement order by direct click
  function orderableFleet() {
    var sel = HOO.Panels.getCurrentSel ? HOO.Panels.getCurrentSel() : null;
    if (!sel || !sel.fleet) return null;
    var f = sel.fleet;
    if (f.empire !== 0) return null;
    if (selectedFleet !== f) return null;
    // orbiting fleet with at least one ship selected, or in-transit fleet with hypercomm
    var any = sel.counts && sel.counts.some(function (n) { return n > 0; });
    if (f.at !== null && any) return sel;
    if (f.at === null && HOO.game.empires[0].derived.hasHypercomm) return sel;
    return null;
  }

  function onUp(e) {
    var wasDrag = dragging && dragging.moved;
    dragging = null;
    if (wasDrag) return;
    var rect = canvas.getBoundingClientRect();
    var w = s2w(e.clientX - rect.left, e.clientY - rect.top);
    var s = starAt(w.x, w.y);
    var f = fleetAt(w.x, w.y);

    if (transportMode) {
      if (s) HOO.Panels.transportTo(s);
      else cancelModes();
      return;
    }
    if (relocMode) {
      if (s) HOO.Panels.relocTo(s);
      else cancelModes();
      return;
    }

    // clicking a fleet blip always selects that fleet
    if (f && (!s || f.at === null)) {
      selectedFleet = f; selectedStar = null;
      HOO.Panels.showFleet(f);
      return;
    }

    if (s) {
      // direct order: own fleet selected → clicking any other star issues movement
      var sel = orderableFleet();
      if (sel && s.id !== sel.fleet.at) {
        HOO.Panels.directDeploy(s);
        return;
      }
      selectedStar = s.id; selectedFleet = null;
      HOO.Panels.showStar(s.id);
      return;
    }

    // empty space: deselect everything
    clearSelection();
    HOO.Panels.showBlank();
  }

  function clearSelection() {
    selectedFleet = null;
    cancelModesQuiet();
  }

  function cancelModesQuiet() {
    deployMode = null; transportMode = null; relocMode = null;
  }

  function centerOn(starId) {
    var g = HOO.game;
    var s = g.stars[starId];
    if (!s) return;
    var r = wrap.getBoundingClientRect();
    view.x = s.x - r.width / view.scale / 2;
    view.y = s.y - r.height / view.scale / 2;
    selectedStar = starId;
  }

  function onWheel(e) {
    e.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left, my = e.clientY - rect.top;
    var before = s2w(mx, my);
    var factor = e.deltaY < 0 ? 1.15 : 0.87;
    view.scale = U.clamp(view.scale * factor, 0.25, 4);
    var after = s2w(mx, my);
    view.x += before.x - after.x;
    view.y += before.y - after.y;
  }

  // ---------- tooltip ----------
  function showTipStar(s, mx, my) {
    var g = HOO.game;
    var html = '<div class="t-name">' + U.esc(s.name) + '</div>';
    if (!s.explored[0]) {
      html += '<div class="t-sub">Unexplored ' + s.color + ' star</div>';
    } else if (!s.planet) {
      html += '<div class="t-sub">No habitable planets</div>';
    } else {
      var p = s.planet;
      var def = HOO.CONST.PLANET_TYPES[p.type];
      var sp = HOO.CONST.SPECIALS[p.special];
      html += '<div class="t-sub">' + def.name + ' · size ' + Math.round(p.size) + (sp.name ? ' · ' + sp.name : '') + '</div>';
      if (p.colony) {
        var emp = g.empires[p.colony.empire];
        html += '<div class="t-sub" style="color:' + emp.color + '">' + U.esc(HOO.DATA.raceById[emp.raceId].name) + ' colony · pop ' + Math.round(p.colony.pop) + '</div>';
      }
    }
    if (s.orion && g.guardian.alive) html += '<div class="t-sub" style="color:#E8635A">Guarded by something vast</div>';
    tip(html, mx, my);
  }

  function showTipFleet(f, mx, my) {
    var g = HOO.game;
    var emp = g.empires[f.empire];
    var html = '<div class="t-name" style="color:' + emp.color + '">' + U.esc(HOO.DATA.raceById[emp.raceId].name) + ' fleet</div>';
    html += '<div class="t-sub">' + HOO.Fleet.shipCount(f) + ' ships' + (f.at === null ? ' · in transit (' + HOO.Fleet.eta(g, f) + ' yr)' : '') + '</div>';
    tip(html, mx, my);
  }

  function tip(html, mx, my) {
    if (!hoverTip) {
      hoverTip = U.el('div', { cls: 'map-tip' });
      wrap.appendChild(hoverTip);
    }
    hoverTip.innerHTML = html;
    hoverTip.style.left = Math.min(mx + 14, wrap.clientWidth - 270) + 'px';
    hoverTip.style.top = (my + 14) + 'px';
    hoverTip.style.display = 'block';
  }
  function hideTip() { if (hoverTip) hoverTip.style.display = 'none'; }

  // ---------- modes ----------
  function setDeployMode(m) { deployMode = m; }
  function setTransportMode(m) { transportMode = m; }
  function setRelocMode(m) { relocMode = m; }
  function cancelModes() {
    deployMode = null; transportMode = null; relocMode = null;
    if (selectedStar !== null) HOO.Panels.showStar(selectedStar);
  }
  function getModes() { return { deploy: deployMode, transport: transportMode, reloc: relocMode }; }

  function select(starId) { selectedStar = starId; selectedFleet = null; }
  function selectFleet(f) { selectedFleet = f; selectedStar = null; }
  function getSelected() { return { star: selectedStar, fleet: selectedFleet }; }

  // ---------- render loop ----------
  function tick() {
    if (!canvas.parentNode) return; // frame torn down
    pulse += 0.04;
    draw();
    requestAnimationFrame(tick);
  }

  function draw() {
    var g = HOO.game;
    if (!g) return;
    var dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cw = canvas.width / dpr, ch = canvas.height / dpr;
    ctx.clearRect(0, 0, cw, ch);

    // background starfield
    if (!starfield) makeStarfield();
    ctx.fillStyle = '#0A0E16';
    ctx.fillRect(0, 0, cw, ch);
    starfield.forEach(function (st) {
      var p = w2s(st.x, st.y);
      if (p.x < -5 || p.y < -5 || p.x > cw + 5 || p.y > ch + 5) return;
      ctx.globalAlpha = st.a;
      ctx.fillStyle = '#8FA3C8';
      ctx.fillRect(p.x, p.y, st.s, st.s);
    });
    ctx.globalAlpha = 1;

    // nebulas
    g.nebulas.forEach(function (nb) {
      var p = w2s(nb.x, nb.y);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(nb.rot);
      ctx.scale(view.scale, view.scale);
      var grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(nb.rx, nb.ry));
      grad.addColorStop(0, 'rgba(120, 80, 190, 0.16)');
      grad.addColorStop(0.7, 'rgba(120, 80, 190, 0.08)');
      grad.addColorStop(1, 'rgba(120, 80, 190, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, nb.rx, nb.ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    var player = g.empires[0];

    // fuel range rings (subtle)
    if (view.showRanges !== false) {
      ctx.strokeStyle = 'rgba(107, 217, 236, 0.07)';
      ctx.lineWidth = 1;
      HOO.Colony.colonies(g, 0).forEach(function (e) {
        var p = w2s(e.star.x, e.star.y);
        ctx.beginPath();
        ctx.arc(p.x, p.y, player.derived.range * HOO.Galaxy.PARSEC * view.scale, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // deploy line preview
    var dm = deployMode || transportMode || relocMode;
    if (dm && hoverTip) { /* line drawn on hover target in modes below */ }

    // relocation lines
    HOO.Colony.colonies(g, 0).forEach(function (e) {
      if (e.colony.reloc !== null && e.colony.reloc !== undefined) {
        var t = g.stars[e.colony.reloc];
        line(e.star.x, e.star.y, t.x, t.y, 'rgba(76,134,216,0.35)', [4, 4]);
      }
    });

    // fleets in transit + destination lines for own fleets
    g.fleets.forEach(function (f) {
      var emp = g.empires[f.empire];
      if (f.empire !== 0 && !visibleToPlayer(g, f)) return;
      if (f.at === null) {
        var t = g.stars[f.to];
        if (f.empire === 0) line(f.x, f.y, t.x, t.y, 'rgba(134,217,146,0.3)', [3, 5]);
        drawFleetBlip(f, emp);
      } else {
        drawFleetBlip(f, emp);
      }
    });

    // transports
    g.transports.forEach(function (t) {
      if (t.empire !== 0 && !HOO.Fleet.scannerSees(g, player, t.x, t.y)) return;
      var emp = g.empires[t.empire];
      var p = w2s(t.x, t.y);
      ctx.fillStyle = emp.color;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // monster
    if (g.monster) {
      var mp = w2s(g.monster.x, g.monster.y);
      ctx.font = (16 * Math.max(0.7, view.scale)) + 'px serif';
      ctx.textAlign = 'center';
      ctx.fillText('👾', mp.x, mp.y);
    }

    // stars
    g.stars.forEach(function (s) { drawStar(s); });

    // selection ring
    if (selectedStar !== null) {
      var ss = g.stars[selectedStar];
      var p2 = w2s(ss.x, ss.y);
      ctx.strokeStyle = 'rgba(227,179,76,' + (0.5 + Math.sin(pulse) * 0.3) + ')';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, 13 + Math.sin(pulse) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawOrderPreview(g);
    refreshBanner(g);
  }

  // ---------- direct-order path preview & banner ----------
  function orderPreviewInfo(g) {
    // returns {src:{x,y}, legal, label} for the active order context + hoverStar
    var emp = g.empires[0];
    if (transportMode) {
      var from = g.stars[transportMode.fromStarId];
      if (!hoverStar || hoverStar.id === from.id) return { src: from, banner: 'Transport ' + transportMode.pop + 'M colonists — click a colonized world · Esc to cancel' };
      var legal = HOO.Fleet.inRange(g, emp, hoverStar, null) &&
        hoverStar.planet && hoverStar.planet.colony &&
        HOO.CONST.PLANET_TYPES[hoverStar.planet.type].hostility <= emp.derived.maxHostility;
      var eta = Math.ceil(U.dist(from.x, from.y, hoverStar.x, hoverStar.y) / HOO.Galaxy.PARSEC / Math.max(1, emp.derived.warp - 1));
      return {
        src: from, dst: hoverStar, legal: legal,
        label: legal ? eta + ' yr' : 'invalid',
        banner: 'Transport ' + transportMode.pop + 'M colonists — click a colonized world · Esc to cancel'
      };
    }
    if (relocMode) {
      var from2 = g.stars[relocMode.starId];
      if (!hoverStar || hoverStar.id === from2.id) return { src: from2, banner: 'Relocate new ships — click one of your colonies · Esc to cancel' };
      var legal2 = hoverStar.planet && hoverStar.planet.colony && hoverStar.planet.colony.empire === 0;
      return {
        src: from2, dst: hoverStar, legal: legal2, label: legal2 ? 'route' : 'invalid',
        banner: 'Relocate new ships — click one of your colonies · Esc to cancel'
      };
    }
    var sel = orderableFleet();
    if (sel) {
      var f = sel.fleet;
      var src = f.at !== null ? g.stars[f.at] : { x: f.x, y: f.y };
      var moving = Math.min.apply(null, [99].concat(sel.counts.map(function (n, slot) {
        return n > 0 && emp.designs[slot] ? emp.designs[slot].warp : 99;
      }).filter(function (w2) { return w2 < 99; })));
      var warp = moving === 99 ? 1 : moving;
      var bannerTxt = f.at !== null ?
        'Fleet selected — click a destination star · Esc to deselect' :
        'Hyperspace comms — click to redirect fleet · Esc to deselect';
      if (!hoverStar || (f.at !== null && hoverStar.id === f.at)) return { src: src, banner: bannerTxt };
      var probe = { ships: sel.counts };
      var legal3 = HOO.Fleet.inRange(g, emp, hoverStar, probe);
      var eta3 = Math.max(1, Math.ceil(U.dist(src.x, src.y, hoverStar.x, hoverStar.y) / HOO.Galaxy.PARSEC / warp));
      return {
        src: src, dst: hoverStar, legal: legal3,
        label: legal3 ? eta3 + ' yr' : 'out of range',
        banner: bannerTxt
      };
    }
    return null;
  }

  function drawOrderPreview(g) {
    var info = orderPreviewInfo(g);
    if (!info || !info.dst) return;
    var color = info.legal ? 'rgba(134,217,146,0.85)' : 'rgba(232,99,90,0.85)';
    line(info.src.x, info.src.y, info.dst.x, info.dst.y, color, [5, 4]);
    var mid = w2s((info.src.x + info.dst.x) / 2, (info.src.y + info.dst.y) / 2);
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = info.legal ? '#86D992' : '#E8635A';
    ctx.fillText(info.label, mid.x, mid.y - 6);
  }

  var bannerText = null;
  function refreshBanner(g) {
    var info = orderPreviewInfo(g);
    var txt = info && info.banner ? info.banner : null;
    if (txt === bannerText) return;
    bannerText = txt;
    if (!txt) {
      if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
      banner = null;
      return;
    }
    if (!banner) {
      banner = U.el('div', { cls: 'order-banner' });
      wrap.appendChild(banner);
    }
    banner.textContent = txt;
  }

  function line(x1, y1, x2, y2, style, dash) {
    var a = w2s(x1, y1), b = w2s(x2, y2);
    ctx.strokeStyle = style;
    ctx.lineWidth = 1.2;
    ctx.setLineDash(dash || []);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function visibleToPlayer(g, f) {
    return HOO.Fleet.scannerSees(g, g.empires[0], f.x, f.y);
  }

  function drawFleetBlip(f, emp) {
    var pos = fleetDrawPos(f);
    var p = w2s(pos.x, pos.y);
    var s = Math.max(4, 5 * view.scale);
    ctx.fillStyle = emp.color;
    ctx.beginPath();
    if (f.at !== null) { // orbiting: triangle pointing left
      ctx.moveTo(p.x - s, p.y);
      ctx.lineTo(p.x + s * 0.7, p.y - s * 0.7);
      ctx.lineTo(p.x + s * 0.7, p.y + s * 0.7);
    } else { // moving: pointing toward destination
      var g = HOO.game;
      var t = g.stars[f.to];
      var ang = Math.atan2(t.y - pos.y, t.x - pos.x);
      ctx.moveTo(p.x + Math.cos(ang) * s * 1.2, p.y + Math.sin(ang) * s * 1.2);
      ctx.lineTo(p.x + Math.cos(ang + 2.5) * s, p.y + Math.sin(ang + 2.5) * s);
      ctx.lineTo(p.x + Math.cos(ang - 2.5) * s, p.y + Math.sin(ang - 2.5) * s);
    }
    ctx.closePath();
    ctx.fill();
    if (selectedFleet === f) {
      ctx.strokeStyle = '#E3B34C';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function drawStar(s) {
    var g = HOO.game;
    var p = w2s(s.x, s.y);
    var r = (s.orion ? 6 : 4) * Math.max(0.6, Math.sqrt(view.scale));

    // glow
    var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3.2);
    grad.addColorStop(0, s.colorHex);
    grad.addColorStop(0.35, s.colorHex + '55');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = s.colorHex;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();

    // colony ring
    if (s.planet && s.planet.colony) {
      var emp = g.empires[s.planet.colony.empire];
      var known = s.planet.colony.empire === 0 || s.explored[0] || HOO.Fleet.scannerSees(g, g.empires[0], s.x, s.y);
      if (known) {
        ctx.strokeStyle = emp.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 3.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    if (s.orion) {
      ctx.strokeStyle = g.guardian.alive ? 'rgba(232,99,90,0.7)' : 'rgba(227,179,76,0.8)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // name
    if (view.scale > 0.5) {
      var name = s.name;
      var known2 = s.explored[0];
      ctx.font = '600 ' + Math.max(9, 10 * view.scale) + 'px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      if (s.planet && s.planet.colony && (known2 || s.planet.colony.empire === 0)) {
        ctx.fillStyle = g.empires[s.planet.colony.empire].color;
      } else {
        ctx.fillStyle = known2 ? '#8492AF' : '#48536B';
      }
      ctx.fillText(known2 || (s.planet && s.planet.colony && s.planet.colony.empire === 0) ? name : '·  ·', p.x, p.y + r + 12);
    }
  }

  function makeStarfield() {
    var g = HOO.game;
    starfield = [];
    // deterministic decorative dust (not the rng stream)
    var n = 300;
    var sd = 9973;
    function r() { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }
    for (var i = 0; i < n; i++) {
      starfield.push({ x: r() * g.w, y: r() * g.h, s: r() < 0.85 ? 1 : 2, a: 0.12 + r() * 0.3 });
    }
  }

  HOO.Map = {
    init: init, fitView: fitView, select: select, selectFleet: selectFleet, getSelected: getSelected,
    setDeployMode: setDeployMode, setTransportMode: setTransportMode, setRelocMode: setRelocMode,
    cancelModes: cancelModes, getModes: getModes,
    centerOn: centerOn, clearSelection: clearSelection
  };
})();
