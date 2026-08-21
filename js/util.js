/* Hamster of Orion — utilities */
globalThis.HOO = globalThis.HOO || {};

(function () {
  'use strict';

  // ----- seeded RNG (mulberry32) -----
  var _rngState = (Date.now() >>> 0);

  function seedRng(s) { _rngState = s >>> 0; }
  function getRngState() { return _rngState; }
  function setRngState(s) { _rngState = s >>> 0; }

  function rand() {
    _rngState = (_rngState + 0x6D2B79F5) >>> 0;
    var t = _rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function rint(min, max) { // inclusive
    return min + Math.floor(rand() * (max - min + 1));
  }

  function roll100() { return rint(1, 100); }

  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rand() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function chance(p) { return rand() < p; }

  // ----- math helpers -----
  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function dist(x1, y1, x2, y2) { var dx = x2 - x1, dy = y2 - y1; return Math.sqrt(dx * dx + dy * dy); }
  function fmt(n, d) {
    if (n === undefined || n === null || isNaN(n)) return '—';
    if (d === undefined) d = 0;
    return Number(n).toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ----- tiny DOM helpers -----
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'cls') e.className = attrs[k];
        else if (k === 'text') e.textContent = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k === 'style') e.setAttribute('style', attrs[k]);
        else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
        else e.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c === null || c === undefined) return;
        e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return e;
  }

  function clearEl(e) { while (e.firstChild) e.removeChild(e.firstChild); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Colours reach markup through style="color:…" and SVG stroke/fill, where
  // escaping alone would not stop a value that closes the attribute. Empire and
  // star colours come out of the save file verbatim, so an imported save is
  // untrusted input: anything that is not a plain hex literal is discarded.
  function safeColor(c) {
    return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#9AA7C0';
  }

  // spoked wheel SVG (the signature motif)
  function wheelSvg(size, color, spokes) {
    spokes = spokes || 8;
    var c = size / 2, rOut = c - 2, rHub = size * 0.11;
    var s = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" fill="none" xmlns="http://www.w3.org/2000/svg">';
    s += '<circle cx="' + c + '" cy="' + c + '" r="' + rOut + '" stroke="' + color + '" stroke-width="' + Math.max(1.5, size * 0.045) + '"/>';
    s += '<circle cx="' + c + '" cy="' + c + '" r="' + rHub + '" fill="' + color + '"/>';
    for (var i = 0; i < spokes; i++) {
      var a = (Math.PI * 2 * i) / spokes;
      var x1 = c + Math.cos(a) * rHub, y1 = c + Math.sin(a) * rHub;
      var x2 = c + Math.cos(a) * (rOut - 1), y2 = c + Math.sin(a) * (rOut - 1);
      s += '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + color + '" stroke-width="' + Math.max(1, size * 0.03) + '"/>';
    }
    s += '</svg>';
    return s;
  }

  // roman numerals for shield classes, marks etc
  function roman(n) {
    var map = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    var out = '';
    for (var i = 0; i < map.length; i++) {
      while (n >= map[i][0]) { out += map[i][1]; n -= map[i][0]; }
    }
    return out || '0';
  }

  HOO.util = {
    seedRng: seedRng, getRngState: getRngState, setRngState: setRngState,
    rand: rand, rint: rint, roll100: roll100, pick: pick, shuffle: shuffle, chance: chance,
    clamp: clamp, lerp: lerp, dist: dist, fmt: fmt,
    el: el, clearEl: clearEl, esc: esc, safeColor: safeColor,
    wheelSvg: wheelSvg, roman: roman
  };
})();
