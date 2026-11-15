/* Line drawings used where a project has no cover image, plus the hero schematic.
   Everything is drawn with currentColor so it follows light and dark mode. */
(function () {
  "use strict";
  var P = window.Portfolio || (window.Portfolio = {});

  function rng(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }
  function f(n) { return Math.round(n * 10) / 10; }
  function svg(body, label) {
    return '<svg viewBox="0 0 320 200" role="img" aria-label="' + (label || "") + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke">' + body + "</svg>";
  }
  function grid() {
    var g = '<g stroke-opacity=".12" stroke-width="1">';
    for (var x = 20; x < 320; x += 20) g += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="200"/>';
    for (var y = 20; y < 200; y += 20) g += '<line x1="0" y1="' + y + '" x2="320" y2="' + y + '"/>';
    return g + "</g>";
  }
  function axes(x0, y0, x1, y1) {
    return '<g stroke-opacity=".7"><line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '"/><line x1="' + x0 + '" y1="' + y0 + '" x2="' + x0 + '" y2="' + y1 + '"/></g>';
  }

  /* Thermal: a finned base with isotherms. */
  function thermal(r) {
    var n = 4 + Math.floor(r() * 3), base = 150, top = 40 + r() * 20, w = 200 / n, out = grid();
    out += '<path d="M50 ' + base + " H270 V" + (base + 18) + " H50 Z" + '"/>';
    for (var i = 0; i < n; i++) {
      var x = 60 + i * w + w * .3;
      out += '<path d="M' + f(x) + " " + base + " V" + f(top) + " H" + f(x + w * .35) + " V" + base + '"/>';
    }
    for (var k = 1; k <= 4; k++) {
      var y = base - k * (base - top) / 4.6, d = "M40 " + f(y + 12);
      for (var j = 0; j <= 24; j++) {
        var xx = 40 + j * 10;
        d += " L" + xx + " " + f(y + Math.sin(j * .9 + k) * (5 - k) + (k * 2));
      }
      out += '<path d="' + d + '" stroke-dasharray="3 4" stroke-opacity="' + (0.9 - k * .15) + '"/>';
    }
    out += '<path d="M160 190 v-14 m-5 5 l5 -5 l5 5" stroke-opacity=".7"/>';
    return svg(out, "Line drawing of a finned surface with isotherms");
  }

  /* Vehicle dynamics: complex plane with eigenvalue markers and a damped oscillation. */
  function vehicle(r) {
    var out = grid() + axes(30, 100, 300, 100) + '<line x1="200" y1="20" x2="200" y2="180" stroke-opacity=".7"/>';
    var z = .08 + r() * .08, wn = .16 + r() * .06, d = "M30 100";
    for (var t = 0; t <= 150; t++) d += " L" + f(30 + t * 1.1) + " " + f(100 - 60 * Math.exp(-z * t * .25) * Math.sin(wn * t));
    out += '<path d="' + d + '"/>';
    var pts = [[170 - r() * 30, 60], [250 + r() * 20, 40 + r() * 20]];
    pts.forEach(function (p) {
      [p, [p[0], 200 - p[1]]].forEach(function (q) {
        out += '<path d="M' + f(q[0] - 5) + " " + f(q[1] - 5) + " l10 10 m0 -10 l-10 10" + '" stroke-width="1.8"/>';
      });
    });
    return svg(out, "Line drawing of eigenvalues and a damped oscillation");
  }

  /* Controls: step response with overshoot against a dashed set-point. */
  function controls(r) {
    var out = grid() + axes(30, 170, 300, 20);
    var z = .25 + r() * .25, wn = .09 + r() * .04, wd = wn * Math.sqrt(1 - z * z), d = "M30 170";
    for (var t = 0; t <= 270; t += 2) {
      var y = 1 - Math.exp(-z * wn * t) * (Math.cos(wd * t) + z / Math.sqrt(1 - z * z) * Math.sin(wd * t));
      d += " L" + (30 + t) + " " + f(170 - y * 110);
    }
    out += '<line x1="30" y1="60" x2="300" y2="60" stroke-dasharray="5 5" stroke-opacity=".6"/>';
    out += '<path d="' + d + '"/>';
    out += '<g stroke-opacity=".6"><rect x="215" y="120" width="60" height="30"/><path d="M195 135 h20 M275 135 h20"/></g>';
    return svg(out, "Line drawing of a step response");
  }

  /* Design & fabrication: a simple circuit schematic. */
  function fabrication(r) {
    var out = grid();
    out += '<path d="M60 60 H130 M190 60 H260 V140 H200 M140 140 H60 V60"/>';
    out += '<rect x="130" y="44" width="60" height="32"/>';
    out += '<path d="M60 92 v16 M48 92 h24 M54 108 h12" stroke-width="1.8"/>';
    out += '<circle cx="170" cy="140" r="14"/><path d="M160 130 l20 20 M180 130 l-20 20" stroke-opacity=".8"/>';
    out += '<path d="M140 140 h16 M184 140 h16"/>';
    var s = 18 + r() * 10;
    out += '<path d="M232 24 l' + f(s * .5) + " " + f(s * .5) + " M244 18 l" + f(s * .5) + " " + f(s * .5) + '" stroke-opacity=".6"/>';
    return svg(out, "Line drawing of a circuit schematic");
  }


  /* Two-phase loop: evaporator, riser, condenser, downcomer (small version for thumbnails). */
  function loop(r) {
    var out = grid();
    out += pipe("M120 150 H76 V60 H130") + pipe("M190 60 H244 V150 H200");
    out += '<rect x="130" y="44" width="60" height="32" style="fill:#fff"/>';
    for (var i = 0; i < 5; i++) out += '<line x1="' + (140 + i * 10) + '" y1="48" x2="' + (140 + i * 10) + '" y2="72" stroke-opacity=".5"/>';
    out += '<rect x="120" y="136" width="80" height="28" style="fill:#fff"/>';
    out += '<path d="M132 182 v-12 m-4 4 l4 -4 4 4 M160 182 v-12 m-4 4 l4 -4 4 4 M188 182 v-12 m-4 4 l4 -4 4 4" stroke-opacity=".7"/>';
    out += '<g fill="currentColor" stroke="none" fill-opacity=".55"><circle cx="75" cy="128" r="2.2"/><circle cx="78" cy="108" r="1.6"/><circle cx="74" cy="90" r="2.6"/></g>';
    return svg(out, "Line drawing of a two-phase thermosyphon loop");
  }
  function pipe(d) {
    return '<path d="' + d + '" stroke-width="10"/><path d="' + d + '" stroke-width="7" style="stroke:#fff"/>';
  }

  /* Turbine blade: aerofoil section with incoming droplets and damage zone. */
  function blade(r) {
    var out = grid();
    out += '<path d="M70 140 C 110 70, 200 50, 262 62 C 210 72, 140 100, 92 150 C 84 156, 66 152, 70 140 Z"/>';
    out += '<path d="M70 140 C 72 132, 78 128, 86 128" stroke-width="3" stroke-opacity=".8"/>';
    for (var i = 0; i < 6; i++) {
      var x = 20 + r() * 30, y = 70 + i * 16;
      out += '<path d="M' + f(x) + " " + f(y) + " l18 6" + '" stroke-opacity=".5"/><circle cx="' + f(x + 22) + '" cy="' + f(y + 7) + '" r="2" fill="currentColor" stroke="none" fill-opacity=".6"/>';
    }
    out += '<path d="M180 150 l30 20 M182 160 l18 12" stroke-opacity=".35"/>';
    return svg(out, "Line drawing of a turbine blade section with water droplets");
  }

  /* Rankine cycle on a T–s diagram with the saturation dome. */
  function cycle(r) {
    var out = grid() + axes(40, 180, 300, 20);
    out += '<path d="M70 178 C 100 60, 150 30, 175 30 C 200 30, 240 80, 270 178" stroke-opacity=".55" stroke-dasharray="4 4"/>';
    var y2 = 140 - r() * 8;
    out += '<path d="M90 160 L92 ' + f(y2) + " L120 " + f(y2) + " L118 70 C 160 70 200 70 228 70 L250 40 L260 160 Z" + '"/>';
    [[90,160],[92,y2],[250,40],[260,160]].forEach(function (q) { out += '<circle cx="' + q[0] + '" cy="' + f(q[1]) + '" r="3" fill="currentColor" stroke="none"/>'; });
    return svg(out, "Line drawing of a Rankine cycle on a temperature–entropy diagram");
  }

  P.art = function (category, seed) {
    var c = (category || "").toLowerCase(), r = rng(seed || c);
    var named = { loop: loop, thermosyphon: loop, blade: blade, turbine: blade, cycle: cycle, rankine: cycle,
      fins: thermal, eigen: vehicle, step: controls, circuit: fabrication };
    if (named[c]) return named[c](r);
    if (c.indexOf("thermal") >= 0 || c.indexOf("fluid") >= 0) return thermal(r);
    if (c.indexOf("vehicle") >= 0 || c.indexOf("dynamic") >= 0) return vehicle(r);
    if (c.indexOf("control") >= 0 || c.indexOf("estimat") >= 0) return controls(r);
    return fabrication(r);
  };

})();
