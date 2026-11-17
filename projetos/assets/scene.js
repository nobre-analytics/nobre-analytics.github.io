/* Paulo Nobre · Projetos: animated backgrounds, drawn on canvas.
   Index: a painterly meadow with drifting sunlight and a small flock that follows a leader.
   Case pages: a slow nebula with twinkling stars.
   Both are original, generated in the browser; no image files. */
(function () {
  var host = document.querySelector('.flares');
  if (!host) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = window.innerWidth < 760;
  var isCase = document.body.classList.contains('case');
  var cv = document.createElement('canvas');
  cv.className = 'scene ' + (isCase ? 'scene--sky' : 'scene--meadow');
  host.insertBefore(cv, host.firstChild);
  var cx = cv.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
  var W, H, t0 = performance.now(), last = t0, running = true;
  var R = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };

  /* ---------- value noise (for the nebula) ---------- */
  var P = new Uint8Array(512);
  (function () { var p = []; for (var i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = p[i]; p[i] = p[j]; p[j] = t; }
    for (i = 0; i < 512; i++) P[i] = p[i & 255]; })();
  function hash(x, y) { return P[(P[x & 255] + y) & 511] / 255; }
  function noise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, o) { var s = 0, a = .5, f = 1; for (var i = 0; i < o; i++) { s += a * noise(x * f, y * f); f *= 2.03; a *= .5; } return s; }

  /* =================== MEADOW =================== */
  var grassDark, grassLit, lightC, sheep = [], leader;
  function paintGrass(w, h, lit) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; var g = c.getContext('2d');
    var lg = g.createLinearGradient(0, 0, w, h);
    if (lit) { lg.addColorStop(0, '#2f7a3a'); lg.addColorStop(1, '#1f5c2b'); }
    else { lg.addColorStop(0, '#103a1d'); lg.addColorStop(1, '#0a2612'); }
    g.fillStyle = lg; g.fillRect(0, 0, w, h);
    var cols = lit ? ['#3f9a48', '#58b257', '#2f7f39', '#79c766', '#4aa04f', '#9fd77f', '#2a6e33']
                   : ['#16502a', '#1d5f31', '#0f3a1c', '#246b37', '#184a25', '#2c7a3e'];
    var n = Math.round(w * h / (lit ? 26 : 34));
    g.lineCap = 'round';
    for (var i = 0; i < n; i++) {
      var x = Math.random() * w, y = Math.random() * h, L = R(3, 11), a = -Math.PI / 2 + R(-.55, .55);
      g.strokeStyle = pick(cols); g.globalAlpha = R(.35, .9); g.lineWidth = R(.7, 1.8);
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
    }
    for (i = 0; i < n / 40; i++) { /* a few flowers/specks */
      g.globalAlpha = R(.3, .8); g.fillStyle = lit ? pick(['#e9f3c8', '#cfe6a6', '#b9d4f0']) : '#2f6a3a';
      g.beginPath(); g.arc(Math.random() * w, Math.random() * h, R(.6, 1.4), 0, 6.3); g.fill();
    }
    g.globalAlpha = 1; return c;
  }
  function makeSheep(x, y) {
    return { x: x, y: y, vx: R(-.2, .2), vy: R(-.2, .2), s: R(.85, 1.15), graze: 0, ph: R(0, 6.3), wool: [] };
  }
  function initMeadow() {
    var sc = .5;
    grassDark = paintGrass(Math.round(W * sc), Math.round(H * sc), false);
    grassLit = paintGrass(Math.round(W * sc), Math.round(H * sc), true);
    lightC = document.createElement('canvas'); lightC.width = grassLit.width; lightC.height = grassLit.height;
    if (!sheep.length) {
      leader = { x: W * R(.3, .7), y: H * R(.3, .7), a: R(0, 6.3) };
      var n = small ? 8 : 14;
      for (var i = 0; i < n; i++) sheep.push(makeSheep(leader.x + R(-260, 260), leader.y + R(-170, 170)));
      sheep.forEach(function (s) { for (var k = 0; k < 7; k++) s.wool.push([R(-.5, .5), R(-.32, .32), R(.22, .34)]); });
    }
  }
  function sunPatches(t) {
    return [
      { x: W * (.5 + .38 * Math.sin(t / 23000)), y: H * (.42 + .25 * Math.cos(t / 31000)), r: Math.max(W, H) * .55 },
      { x: W * (.25 + .3 * Math.cos(t / 27000 + 1)), y: H * (.7 + .2 * Math.sin(t / 19000 + 2)), r: Math.max(W, H) * .38 }
    ];
  }
  function drawSheep(s, t, shadowOnly) {
    var size = (small ? 18 : 25) * s.s, a = Math.atan2(s.vy, s.vx);
    if (shadowOnly) { cx.save(); cx.translate(s.x + size * .55, s.y + size * .65); cx.rotate(a);   /* shadow */
    cx.fillStyle = 'rgba(0,10,4,.38)'; cx.beginPath(); cx.ellipse(0, 0, size * .95, size * .62, 0, 0, 6.3); cx.fill(); cx.restore(); return; }
    cx.save(); cx.translate(s.x, s.y); cx.rotate(a);
    var bob = s.graze > 0 ? Math.sin(t / 260 + s.ph) * size * .05 : 0;
    cx.fillStyle = '#ece8dc';
    s.wool.forEach(function (w) { cx.beginPath(); cx.arc(w[0] * size * 1.4, w[1] * size * 1.3, w[2] * size * 1.3, 0, 6.3); cx.fill(); });
    cx.beginPath(); cx.ellipse(0, 0, size * .82, size * .55, 0, 0, 6.3); cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.beginPath(); cx.ellipse(-size * .1, -size * .18, size * .45, size * .22, 0, 0, 6.3); cx.fill();
    cx.fillStyle = '#d9d2c2'; /* head */
    cx.beginPath(); cx.ellipse(size * .88 + bob, 0, size * .3, size * .22, 0, 0, 6.3); cx.fill();
    cx.fillStyle = '#bdb3a0';
    cx.beginPath(); cx.ellipse(size * .78 + bob, -size * .24, size * .12, size * .06, -.6, 0, 6.3); cx.fill();
    cx.beginPath(); cx.ellipse(size * .78 + bob, size * .24, size * .12, size * .06, .6, 0, 6.3); cx.fill();
    cx.restore();
  }
  function stepMeadow(dt, t) {
    leader.a += R(-.02, .02);
    var mx = W * .5 - leader.x, my = H * .5 - leader.y;               /* stay roughly on screen */
    var toC = Math.atan2(my, mx), diff = Math.atan2(Math.sin(toC - leader.a), Math.cos(toC - leader.a));
    if (Math.hypot(mx, my) > Math.min(W, H) * .3) leader.a += diff * .03;
    leader.x += Math.cos(leader.a) * .018 * dt; leader.y += Math.sin(leader.a) * .018 * dt;
    sheep.forEach(function (s, i) {
      if (s.graze > 0) { s.graze -= dt; s.vx *= .9; s.vy *= .9; }
      else if (Math.random() < .0007 * dt / 16) s.graze = R(1500, 4500);
      var ax = (leader.x - s.x) * .000025, ay = (leader.y - s.y) * .000025;
      sheep.forEach(function (o, j) { if (i === j) return; var dx = s.x - o.x, dy = s.y - o.y, d2 = dx * dx + dy * dy;
        if (d2 < 5200) { ax += dx / (d2 + 1) * .09; ay += dy / (d2 + 1) * .09; }
        else if (d2 < 9000) { ax += o.vx * .0015; ay += o.vy * .0015; } });
      if (s.graze <= 0) { s.vx += ax * dt; s.vy += ay * dt; }
      var sp = Math.hypot(s.vx, s.vy), max = .028;
      if (sp > max) { s.vx *= max / sp; s.vy *= max / sp; }
      s.x += s.vx * dt; s.y += s.vy * dt;
    });
  }
  function frameMeadow(t, dt) {
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx.drawImage(grassDark, 0, 0, W, H);
    var lc = lightC.getContext('2d'), k = lightC.width / W;
    lc.globalCompositeOperation = 'source-over'; lc.clearRect(0, 0, lightC.width, lightC.height);
    lc.drawImage(grassLit, 0, 0);
    lc.globalCompositeOperation = 'destination-in';
    sunPatches(t).forEach(function (p) {
      var g = lc.createRadialGradient(p.x * k, p.y * k, 0, p.x * k, p.y * k, p.r * k);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.5, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      lc.fillStyle = g; lc.fillRect(0, 0, lightC.width, lightC.height);
    });
    cx.drawImage(lightC, 0, 0, W, H);
    if (!reduce) stepMeadow(dt, t);
    sheep.forEach(function (s) { drawSheep(s, t, true); }); sheep.forEach(function (s) { drawSheep(s, t, false); });
  }

  /* =================== NEBULA =================== */
  var neb, stars = [];
  function paintNebula() {
    var w = small ? 300 : 520, h = Math.round(w * H / W), c = document.createElement('canvas');
    c.width = w; c.height = h; var g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    var s = 3.2 / w;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var nx = x * s, ny = y * s;
      var q = fbm(nx + 4.1, ny + 1.7, 5);
      var blue = Math.pow(Math.max(0, fbm(nx + q * 1.6, ny + q * 1.2, 6) - .35) * 1.9, 1.5);
      var dust = Math.pow(Math.max(0, fbm(nx * 1.3 + 9.3 + q, ny * 1.3 + 3.1, 6) - .42) * 2.2, 1.4);
      var core = Math.exp(-(Math.pow((x / w - .58) * 1.6, 2) + Math.pow((y / h - .42) * 1.4, 2)) * 3);
      var r = 4 + blue * 70 + dust * 150 + core * blue * 60;
      var gg = 8 + blue * 120 + dust * 100 + core * blue * 70;
      var b = 18 + blue * 190 + dust * 55 + core * blue * 50;
      var i4 = (y * w + x) * 4; d[i4] = Math.min(255, r); d[i4 + 1] = Math.min(255, gg); d[i4 + 2] = Math.min(255, b); d[i4 + 3] = 255;
    }
    g.putImageData(img, 0, 0); return c;
  }
  function initSky() {
    neb = paintNebula();
    stars = [];
    var n = Math.round(W * H / (small ? 2600 : 1700));
    for (var i = 0; i < n; i++) stars.push({ x: Math.random(), y: Math.random(), z: Math.pow(Math.random(), 2.2),
      c: pick(['255,255,255', '200,220,255', '255,226,190', '170,200,255']), ph: R(0, 6.3), f: R(.4, 1.6) });
  }
  function frameSky(t) {
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
    cx.fillStyle = '#03050c'; cx.fillRect(0, 0, W, H);
    var z = 1.12 + .05 * Math.sin(t / 26000), rot = Math.sin(t / 40000) * .03;
    cx.save(); cx.translate(W / 2, H / 2); cx.rotate(rot); cx.scale(z, z);
    cx.globalAlpha = .95; cx.drawImage(neb, -W / 2 + Math.sin(t / 30000) * W * .02, -H / 2 + Math.cos(t / 34000) * H * .02, W, H);
    cx.globalCompositeOperation = 'screen'; cx.globalAlpha = .25;
    cx.scale(1.08, 1.08); cx.drawImage(neb, -W / 2 - Math.sin(t / 22000) * W * .03, -H / 2, W, H);
    cx.restore(); cx.globalCompositeOperation = 'source-over';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], tw = .55 + .45 * Math.sin(t / 1000 * s.f + s.ph);
      var x = ((s.x + t * 0.0000025 * (s.z + .2)) % 1) * W, y = s.y * H, r = .4 + s.z * 1.6;
      cx.globalAlpha = (.25 + s.z * .75) * tw; cx.fillStyle = 'rgb(' + s.c + ')';
      cx.beginPath(); cx.arc(x, y, r, 0, 6.3); cx.fill();
      if (s.z > .92) { cx.globalAlpha *= .5; cx.fillRect(x - r * 4, y - .4, r * 8, .8); cx.fillRect(x - .4, y - r * 4, .8, r * 8); }
    }
    cx.globalAlpha = 1;
  }

  /* =================== loop =================== */
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    if (isCase) initSky(); else initMeadow();
  }
  function frame(now) {
    var dt = Math.min(50, now - last); last = now;
    if (running) { var t = now - t0; if (isCase) frameSky(t); else frameMeadow(t, dt); }
    if (!reduce) requestAnimationFrame(frame);
  }
  resize();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 250); });
  document.addEventListener('visibilitychange', function () { running = !document.hidden; last = performance.now(); });
  requestAnimationFrame(frame);
})();
