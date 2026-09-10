(function () {
  'use strict';

  var STORE = 'hiragana-practice-v2';
  var OLD_STORE = 'hiragana-practice-v1';

  var state = {
    screen: 'menu',            // menu | read | write | picker
    off: {},                   // kana -> true means "switched off"
    stats: {},                 // kana -> { seen, wrong }
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

    if (saved) {
      state.off = saved.off || {};
      state.stats = saved.stats || {};
      return;
    }

    // Nothing in the new format. Carry over a save from the row-based version.
    var old = null;
    try { old = JSON.parse(localStorage.getItem(OLD_STORE)); } catch (e) { old = null; }
    if (!old) return;

    state.stats = old.stats || {};
    if (old.rows) {
      KANA.forEach(function (k) {
        if (old.rows[k.row] === false) state.off[k.kana] = true;
      });
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ off: state.off, stats: state.stats }));
    } catch (e) { /* private browsing - just don't persist */ }
  }

  function stat(kana) {
    if (!state.stats[kana]) state.stats[kana] = { seen: 0, wrong: 0 };
    return state.stats[kana];
  }

  // ---------- choosing a character ----------
  function pool() {
    return KANA.filter(function (k) { return !state.off[k.kana]; });
  }

  // Characters you get wrong, and ones you have not seen yet, come up more often.
  function pick() {
    var list = pool();
    if (!list.length) return null;
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

  // Wrong answers come from look-alikes and same-row neighbours where possible,
  // so the choice is a real test rather than an obvious one. They are drawn from
  // the whole alphabet, not just the switched-on characters - otherwise turning
  // on only one row would leave nothing to choose between.
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
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  var screens = {
    menu: $('menuScreen'),
    read: $('readScreen'),
    write: $('writeScreen'),
    picker: $('pickerScreen')
  };

  var readKana = $('readKana'), choices = $('choices'), readFeedback = $('readFeedback');
  var writeRomaji = $('writeRomaji'), ghost = $('ghost');
  var writeActions = $('writeActions'), gradeActions = $('gradeActions');

  function updateScore() {
    all('.js-right').forEach(function (el) { el.textContent = state.right; });
    all('.js-total').forEach(function (el) { el.textContent = state.total; });
  }

  // ---------- screens ----------
  function show(name) {
    state.screen = name;
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('hidden', key !== name);
    });
  }

  function toMenu() {
    show('menu');
    refreshMenu();
  }

  function startPractice(mode) {
    if (!pool().length) return;
    state.right = 0;
    state.total = 0;
    state.lastKana = null;
    updateScore();
    show(mode);
    if (mode === 'read') {
      nextRead();
    } else {
      nextWrite();
      requestAnimationFrame(sizePad);
    }
  }

  function refreshMenu() {
    var on = pool().length;
    $('pickerCount').textContent = on + ' of ' + KANA.length + ' characters';
    $('goRead').disabled = on === 0;
    $('goWrite').disabled = on === 0;

    var weak = Object.keys(state.stats)
      .filter(function (k) { return state.stats[k].wrong > 0; })
      .sort(function (a, b) { return state.stats[b].wrong - state.stats[a].wrong; })
      .slice(0, 10);

    var box = $('menuWeak');
    box.innerHTML = '';
    if (on === 0) {
      box.textContent = 'No characters switched on yet.';
    } else if (weak.length) {
      box.appendChild(document.createTextNode('Needs work: '));
      var b = document.createElement('b');
      b.textContent = weak.join('  ');
      box.appendChild(b);
    }
  }

  all('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', toMenu);
  });

  $('goRead').addEventListener('click', function () { startPractice('read'); });
  $('goWrite').addEventListener('click', function () { startPractice('write'); });
  $('goPicker').addEventListener('click', function () { drawChart(); show('picker'); });

  // ---------- identify ----------
  function nextRead() {
    state.locked = false;
    state.current = pick();
    if (!state.current) { toMenu(); return; }
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
    setTimeout(function () {
      if (state.screen === 'read') nextRead();
    }, correct ? 450 : 1500);
  }

  // ---------- write ----------
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
    if (!state.current) { toMenu(); return; }
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

  // ---------- character picker ----------
  var chart = $('chart');

  function isRowOn(row) {
    return row.cells.some(function (c) { return c && !state.off[c[0]]; });
  }

  function drawChart() {
    chart.innerHTML = '';

    // header: an empty corner, then the vowel column labels
    chart.appendChild(document.createElement('div'));
    VOWELS.forEach(function (v) {
      var h = document.createElement('div');
      h.className = 'col-head';
      h.textContent = v;
      chart.appendChild(h);
    });

    CHART.forEach(function (row) {
      var head = document.createElement('button');
      head.className = 'row-head';
      head.textContent = row.label;
      head.addEventListener('click', function () { toggleRow(row); });
      chart.appendChild(head);

      row.cells.forEach(function (cell) {
        if (!cell) {
          var blank = document.createElement('div');
          blank.className = 'cell-blank';
          chart.appendChild(blank);
          return;
        }
        var kana = cell[0], romaji = cell[1];
        var b = document.createElement('button');
        b.className = 'cell ' + (state.off[kana] ? 'off' : 'on');
        b.dataset.kana = kana;

        var k = document.createElement('span');
        k.className = 'c-kana';
        k.textContent = kana;
        var r = document.createElement('span');
        r.className = 'c-romaji';
        r.textContent = romaji;
        b.appendChild(k);
        b.appendChild(r);

        b.addEventListener('click', function () {
          if (state.off[kana]) { delete state.off[kana]; } else { state.off[kana] = true; }
          b.className = 'cell ' + (state.off[kana] ? 'off' : 'on');
          save();
          updatePickerFoot();
        });

        chart.appendChild(b);
      });
    });

    updatePickerFoot();
  }

  // Tapping the row label switches the whole row off, or back on if any of it
  // is already off.
  function toggleRow(row) {
    var turnOff = isRowOn(row);
    row.cells.forEach(function (c) {
      if (!c) return;
      if (turnOff) { state.off[c[0]] = true; } else { delete state.off[c[0]]; }
    });
    save();
    drawChart();
  }

  function updatePickerFoot() {
    $('pickerFoot').textContent = pool().length + ' of ' + KANA.length + ' on';
  }

  $('pickAll').addEventListener('click', function () {
    state.off = {};
    save();
    drawChart();
  });

  $('pickNone').addEventListener('click', function () {
    KANA.forEach(function (k) { state.off[k.kana] = true; });
    save();
    drawChart();
  });

  $('pickReset').addEventListener('click', function () {
    state.stats = {};
    state.right = 0;
    state.total = 0;
    updateScore();
    save();
    $('pickReset').textContent = 'Progress cleared';
    setTimeout(function () { $('pickReset').textContent = 'Reset progress'; }, 1500);
  });

  // ---------- keyboard (desktop) ----------
  document.addEventListener('keydown', function (e) {
    if (state.screen === 'menu' || state.screen === 'picker') {
      if (e.key === 'Escape' && state.screen === 'picker') toMenu();
      return;
    }
    if (e.key === 'Escape') { toMenu(); return; }

    if (state.screen === 'read') {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= choices.children.length) {
        e.preventDefault();
        choices.children[n - 1].click();
      }
      return;
    }

    // write screen
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
    if (state.screen === 'write') sizePad();
  });

  window.addEventListener('orientationchange', function () {
    setTimeout(function () { if (state.screen === 'write') sizePad(); }, 250);
  });

  load();
  updateScore();
  toMenu();
})();
