(function () {
  'use strict';

  var STORE = 'hiragana-practice-v1';

  var state = {
    mode: 'read',
    rows: {},              // row id -> true/false
    stats: {},             // kana -> { seen, wrong }
    right: 0,
    total: 0,
    current: null,
    lastKana: null,
    locked: false
  };

  // ---------- storage ----------
  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) { saved = null; }
    if (saved && saved.rows) {
      state.rows = saved.rows;
      state.stats = saved.stats || {};
      state.mode = saved.mode || 'read';
    } else {
      ROWS.forEach(function (r) { state.rows[r.id] = true; });
    }
    // guard against a save made with an older row list
    ROWS.forEach(function (r) {
      if (typeof state.rows[r.id] !== 'boolean') state.rows[r.id] = true;
    });
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        rows: state.rows, stats: state.stats, mode: state.mode
      }));
    } catch (e) { /* private browsing - just don't persist */ }
  }

  function stat(kana) {
    if (!state.stats[kana]) state.stats[kana] = { seen: 0, wrong: 0 };
    return state.stats[kana];
  }

  // ---------- picking a character ----------
  function pool() {
    var list = KANA.filter(function (k) { return state.rows[k.row]; });
    return list.length ? list : KANA.slice();
  }

  // Characters you get wrong, and ones you have not seen yet, come up more often.
  function pick() {
    var list = pool();
    if (list.length > 1 && state.lastKana) {
      list = list.filter(function (k) { return k.kana !== state.lastKana; });
    }
    var weights = list.map(function (k) {
      var s = stat(k.kana);
      var w = 1 + s.wrong * 3;
      if (s.seen === 0) w += 2;
      return w;
    });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < list.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function byKana(kana) {
    for (var i = 0; i < KANA.length; i++) {
      if (KANA[i].kana === kana) return KANA[i];
    }
    return null;
  }

  // Wrong answers: prefer look-alikes and same-row neighbours over random noise.
  function distractors(target, n) {
    var near = [];
    LOOKALIKES.forEach(function (group) {
      if (group.indexOf(target.kana) !== -1) near = near.concat(group);
    });
    var sameRow = KANA.filter(function (k) { return k.row === target.row; })
                      .map(function (k) { return k.kana; });
    var everything = KANA.map(function (k) { return k.kana; });
    var ordered = shuffle(near).concat(shuffle(sameRow)).concat(shuffle(everything));

    var out = [];
    var used = {};
    used[target.romaji] = true;
    for (var i = 0; i < ordered.length && out.length < n; i++) {
      var hit = byKana(ordered[i]);
      if (!hit || used[hit.romaji]) continue;
      used[hit.romaji] = true;
      out.push(hit);
    }
    return out;
  }

  // ---------- elements ----------
  function $(id) { return document.getElementById(id); }

  var readPane = $('readPane'), writePane = $('writePane');
  var readKana = $('readKana'), choices = $('choices'), readFeedback = $('readFeedback');
  var writeRomaji = $('writeRomaji'), ghost = $('ghost');
  var writeActions = $('writeActions'), gradeActions = $('gradeActions');
  var sheet = $('sheet'), rowList = $('rowList'), weakList = $('weakList');

  function updateScore() {
    $('scoreRight').textContent = state.right;
    $('scoreTotal').textContent = state.total;
  }

  // ---------- read mode ----------
  function nextRead() {
    state.locked = false;
    state.current = pick();
    state.lastKana = state.current.kana;
    readKana.textContent = state.current.kana;
    readFeedback.textContent = '';

    var options = shuffle(distractors(state.current, 3).concat([state.current]));
    choices.innerHTML = '';
    options.forEach(function (opt, i) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.dataset.romaji = opt.romaji;
      b.appendChild(document.createTextNode(opt.romaji));
      var hint = document.createElement('span');       // number key, desktop only
      hint.className = 'hint';
      hint.textContent = i + 1;
      b.appendChild(hint);
      b.addEventListener('click', function () { answerRead(b, opt); });
      choices.appendChild(b);
    });
  }

  function answerRead(button, opt) {
    if (state.locked) return;
    state.locked = true;

    var correct = opt.kana === state.current.kana;
    var s = stat(state.current.kana);
    s.seen++;
    state.total++;

    if (correct) {
      state.right++;
      if (s.wrong > 0) s.wrong--;          // a right answer pays down the penalty
      button.classList.add('right');
    } else {
      s.wrong++;
      button.classList.add('wrong');
      readFeedback.textContent = state.current.kana + '  is  "' + state.current.romaji + '"';
      Array.prototype.forEach.call(choices.children, function (el) {
        if (el.dataset.romaji === state.current.romaji) el.classList.add('right');
      });
    }
    Array.prototype.forEach.call(choices.children, function (el) { el.disabled = true; });

    updateScore();
    save();
    setTimeout(nextRead, correct ? 450 : 1500);
  }

  // ---------- write mode ----------
  var pad = $('pad'), ctx = pad.getContext('2d');
  var drawing = false, dpr = 1;

  function cssVar(name, fallback) {
    var v = getComputedStyle(document.body).getPropertyValue(name).trim();
    return v || fallback;
  }

  function guides() {
    var w = pad.width, h = pad.height;
    ctx.save();
    ctx.strokeStyle = cssVar('--line', '#333');
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = Math.max(1, dpr);
    ctx.setLineDash([6 * dpr, 8 * dpr]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.restore();
  }

  function clearPad() {
    ctx.clearRect(0, 0, pad.width, pad.height);
    guides();
    ctx.strokeStyle = cssVar('--ink', '#fff');
    ctx.lineWidth = 9 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function sizePad() {
    dpr = window.devicePixelRatio || 1;
    var box = pad.getBoundingClientRect();
    if (!box.width || !box.height) return;
    pad.width = Math.round(box.width * dpr);
    pad.height = Math.round(box.height * dpr);
    clearPad();
  }

  function point(e) {
    var box = pad.getBoundingClientRect();
    return { x: (e.clientX - box.left) * dpr, y: (e.clientY - box.top) * dpr };
  }

  pad.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    drawing = true;
    if (pad.setPointerCapture) { try { pad.setPointerCapture(e.pointerId); } catch (err) {} }
    var p = point(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);      // a plain tap still leaves a dot
    ctx.stroke();
  });

  pad.addEventListener('pointermove', function (e) {
    if (!drawing) return;
    e.preventDefault();
    var p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
    pad.addEventListener(evt, function () { drawing = false; });
  });

  function nextWrite() {
    state.current = pick();
    state.lastKana = state.current.kana;
    writeRomaji.textContent = state.current.romaji;
    ghost.textContent = state.current.kana;
    ghost.classList.remove('show');
    writeActions.classList.remove('hidden');
    gradeActions.classList.add('hidden');
    clearPad();
  }

  function reveal() {
    ghost.classList.add('show');
    writeActions.classList.add('hidden');
    gradeActions.classList.remove('hidden');
  }

  function gradeWrite(correct) {
    var s = stat(state.current.kana);
    s.seen++;
    state.total++;
    if (correct) {
      state.right++;
      if (s.wrong > 0) s.wrong--;
    } else {
      s.wrong++;
    }
    updateScore();
    save();
    nextWrite();
  }

  $('btnClear').addEventListener('click', clearPad);
  $('btnReveal').addEventListener('click', reveal);
  $('btnGot').addEventListener('click', function () { gradeWrite(true); });
  $('btnMissed').addEventListener('click', function () { gradeWrite(false); });

  // ---------- modes ----------
  function setMode(mode) {
    state.mode = mode;
    $('tabRead').classList.toggle('is-on', mode === 'read');
    $('tabWrite').classList.toggle('is-on', mode === 'write');
    readPane.classList.toggle('hidden', mode !== 'read');
    writePane.classList.toggle('hidden', mode !== 'write');
    save();
    if (mode === 'read') {
      nextRead();
    } else {
      nextWrite();
      requestAnimationFrame(sizePad);
    }
  }

  $('tabRead').addEventListener('click', function () { setMode('read'); });
  $('tabWrite').addEventListener('click', function () { setMode('write'); });

  // ---------- settings ----------
  function drawRows() {
    rowList.innerHTML = '';
    ROWS.forEach(function (r) {
      var b = document.createElement('button');
      b.className = 'row-toggle' + (state.rows[r.id] ? ' on' : '');
      var dot = document.createElement('span');
      dot.className = 'dot';
      var label = document.createElement('span');
      label.textContent = r.label;
      b.appendChild(dot);
      b.appendChild(label);
      b.addEventListener('click', function () {
        state.rows[r.id] = !state.rows[r.id];
        var any = ROWS.some(function (x) { return state.rows[x.id]; });
        if (!any) state.rows[r.id] = true;        // never leave the pool empty
        b.classList.toggle('on', state.rows[r.id]);
        save();
      });
      rowList.appendChild(b);
    });
  }

  function drawWeak() {
    var weak = Object.keys(state.stats)
      .filter(function (k) { return state.stats[k].wrong > 0; })
      .sort(function (a, b) { return state.stats[b].wrong - state.stats[a].wrong; })
      .slice(0, 10);

    weakList.innerHTML = '';
    if (!weak.length) {
      weakList.textContent = 'No trouble characters yet.';
      return;
    }
    weakList.appendChild(document.createTextNode('Needs work: '));
    var b = document.createElement('b');
    b.textContent = weak.join('  ');
    weakList.appendChild(b);
  }

  $('btnSettings').addEventListener('click', function () {
    drawRows();
    drawWeak();
    sheet.classList.remove('hidden');
  });

  $('btnClose').addEventListener('click', function () {
    sheet.classList.add('hidden');
    setMode(state.mode);          // reload the question using the new row selection
  });

  sheet.addEventListener('click', function (e) {
    if (e.target === sheet) $('btnClose').click();
  });

  $('btnAllRows').addEventListener('click', function () {
    ROWS.forEach(function (r) { state.rows[r.id] = true; });
    drawRows();
    save();
  });

  $('btnReset').addEventListener('click', function () {
    state.stats = {};
    state.right = 0;
    state.total = 0;
    updateScore();
    drawWeak();
    save();
  });

  // ---------- keyboard (desktop) ----------
  document.addEventListener('keydown', function (e) {
    if (!sheet.classList.contains('hidden')) {
      if (e.key === 'Escape') $('btnClose').click();
      return;
    }
    if (state.mode === 'read') {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= choices.children.length) {
        e.preventDefault();
        choices.children[n - 1].click();
      }
      return;
    }
    // write mode
    var revealed = !gradeActions.classList.contains('hidden');
    if (e.key === 'c') { e.preventDefault(); clearPad(); return; }
    if (!revealed && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      reveal();
    } else if (revealed && (e.key === 'y' || e.key === 'ArrowRight' || e.key === 'Enter')) {
      e.preventDefault();
      gradeWrite(true);
    } else if (revealed && (e.key === 'n' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      gradeWrite(false);
    }
  });

  // ---------- go ----------
  window.addEventListener('resize', function () {
    if (state.mode === 'write') sizePad();
  });

  window.addEventListener('orientationchange', function () {
    setTimeout(function () { if (state.mode === 'write') sizePad(); }, 250);
  });

  load();
  updateScore();
  setMode(state.mode);
  sizePad();
})();
