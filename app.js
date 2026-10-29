(function () {
  'use strict';

  var STORE = 'hiragana-practice-v2';
  var OLD_STORE = 'hiragana-practice-v1';

  // Which set of characters is being practised. Everything below reads the
  // active set rather than a fixed list, so adding katakana is a data change.
  var current = SETS[0];

  var state = {
    screen: 'home',            // home | menu | read | write | copy | picker | words | reference
    chartFrom: 'read',         // which drill the reference chart was opened from
    combo: ['hiragana', 'dakuten', 'katakana'],   // ticked in the combination set
    wordRomaji: false,         // show the reading before you have answered?
    volume: 'mid',             // off | low | mid | high - one setting for all audio
    difficulty: 'easy',        // easy | medium | hard - where wrong answers come from
    writeOrder: 'random',      // random | list - how Write picks the next character
    copyRow: true,             // Copy a whole row at a time, rather than one character
    trainDraw: false,          // Train by writing the sound by hand, rather than typing it
    exam: null,                // the exam in progress, or null
    examSeen: {},              // what this round of exams has already covered
    listIndex: 0,              // position through the chart when running in order
    off: {},                   // kana -> true means "switched off"
    stats: {},                 // kana -> { seen, wrong }
    right: 0,
    total: 0,
    current: null,
    locked: false
  };

  // ---------- storage ----------
  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) { saved = null; }

    if (saved) {
      state.off = saved.off || {};
      state.stats = saved.stats || {};
      if (saved.difficulty) state.difficulty = saved.difficulty;
      if (saved.set) current = setById(saved.set);
      if (saved.combo && saved.combo.length) state.combo = saved.combo;
      if (typeof saved.wordRomaji === 'boolean') state.wordRomaji = saved.wordRomaji;
      state.examSeen = saved.examSeen || {};
      if (saved.volume) state.volume = saved.volume;
      if (typeof saved.copyRow === 'boolean') state.copyRow = saved.copyRow;
      if (typeof saved.trainDraw === 'boolean') state.trainDraw = saved.trainDraw;
      return;
    }

    // Nothing in the new format. Carry over a save from the row-based version.
    var old = null;
    try { old = JSON.parse(localStorage.getItem(OLD_STORE)); } catch (e) { old = null; }
    if (!old) return;

    state.stats = old.stats || {};
    if (old.rows) {
      SETS[0].kana.forEach(function (k) {
        if (old.rows[k.row] === false) state.off[k.kana] = true;
      });
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        off: state.off, stats: state.stats, difficulty: state.difficulty, set: current.id,
        combo: state.combo, wordRomaji: state.wordRomaji, examSeen: state.examSeen,
        volume: state.volume, copyRow: state.copyRow, trainDraw: state.trainDraw
      }));
    } catch (e) { /* private browsing - just don't persist */ }
  }

  function stat(kana) {
    if (!state.stats[kana]) state.stats[kana] = { seen: 0, wrong: 0 };
    return state.stats[kana];
  }

  // ---------- choosing a character ----------
  // Which characters carry a mark, worked out from the dakuten set rather than
  // tagged by hand in words.js.
  var dakutenChars = {};
  setById('dakuten').kana.forEach(function (k) { dakutenChars[k.kana] = true; });

  function pool() {
    return current.kana.filter(function (k) { return !state.off[k.kana]; });
  }

  // How likely something is to come up next. Two things push it to the front:
  // having barely been tested yet, and being got wrong.
  //
  //   never seen      1 + 8 + 0  =  9
  //   seen once       1 + 6 + 0  =  7
  //   seen four times 1 + 0 + 0  =  1     <- settled
  //   one miss        1 + 0 + 4  =  5
  //   three misses    1 + 0 + 12 = 13
  //
  // The old version only looked at `seen` when it was zero, so a character
  // drilled thirty times weighed the same as one drilled once.
  function weightFor(key) {
    var s = stat(key);
    return 1 + Math.max(0, 4 - s.seen) * 2 + s.wrong * 4;
  }

  // The last few asked, so the same character does not come round immediately.
  var recent = [];

  function remember(key) {
    recent.push(key);
    while (recent.length > 3) recent.shift();
  }

  function forgetRecent() { recent = []; }

  // Weighted pick from a list, skipping anything asked in the last few turns -
  // but only while that still leaves a real choice.
  function pickFrom(list, keyOf) {
    if (!list.length) return null;

    var fresh = list.filter(function (item) { return recent.indexOf(keyOf(item)) === -1; });
    if (fresh.length >= 2) list = fresh;

    var weights = list.map(function (item) { return weightFor(keyOf(item)); });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < list.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function kanaKey(k) { return k.kana; }

  function pick() {
    return pickFrom(pool(), kanaKey);
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // How a sound is written, with the real pronunciation after it where the two
  // differ: "di (ji)", "wo (o)". Most characters just show their romaji.
  function labelText(k) {
    return k.sound ? k.romaji + ' (' + k.sound + ')' : k.romaji;
  }

  function byKana(kana) {
    for (var i = 0; i < current.kana.length; i++) {
      if (current.kana[i].kana === kana) return current.kana[i];
    }
    return null;
  }

  // Wrong answers are drawn from `candidates`, in an order that depends on the
  // difficulty:
  //
  //   easy   - the character's own row first, so a question about く is answered
  //            against か き け こ. Predictable, and what you want on a new row.
  //   medium - look-alikes first, then anything else, with no row preference, so
  //            the wrong answers spread across every row you switched on.
  //   hard   - the same ordering as medium, but `candidates` is the whole set
  //            rather than just your selection.
  function distractors(target, n, candidates, level) {
    var allowed = {};
    candidates.forEach(function (k) { allowed[k.kana] = true; });

    var near = [];
    LOOKALIKES.forEach(function (group) {
      if (group.indexOf(target.kana) !== -1) near = near.concat(group);
    });
    near = near.filter(function (kana) { return allowed[kana]; });

    var sameRow = candidates.filter(function (k) { return k.row === target.row; })
                            .map(function (k) { return k.kana; });
    var rest = candidates.map(function (k) { return k.kana; });

    var ordered = level === 'easy'
      ? shuffle(sameRow).concat(shuffle(near)).concat(shuffle(rest))
      : shuffle(near).concat(shuffle(rest));

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

  // How many answer buttons to show, and what to build them from.
  function answerSet(target) {
    var candidates = state.difficulty === 'hard' ? current.kana : pool();
    // Two characters is the smallest question that means anything. If the
    // selection is smaller than that, fall back to the whole set.
    if (candidates.length < 2) candidates = current.kana;
    var count = Math.min(4, candidates.length);
    return shuffle(distractors(target, count - 1, candidates, state.difficulty).concat([target]));
  }

  // ---------- elements ----------
  function $(id) { return document.getElementById(id); }
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  var screens = {
    home: $('homeScreen'),
    menu: $('menuScreen'),
    read: $('readScreen'),
    train: $('trainScreen'),
    write: $('writeScreen'),
    copy: $('copyScreen'),
    picker: $('pickerScreen'),
    words: $('wordsScreen'),
    sentence: $('sentenceScreen'),
    reference: $('refScreen'),
    exam: $('examScreen')
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
    // A box being typed in keeps the phone keyboard up even after its screen
    // is hidden, so let go of it whenever the screen changes.
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    state.screen = name;
    Object.keys(screens).forEach(function (key) {
      screens[key].classList.toggle('hidden', key !== name);
    });
  }

  function toHome() {
    endExam();
    settleTrain();
    show('home');
  }

  function toMenu() {
    endExam();
    settleTrain();
    show('menu');
    refreshMenu();
  }

  // Switching set clears nothing - progress is stored per character, and no
  // character appears in two sets.
  function chooseSet(id) {
    current = setById(id);
    if (current.isCombo) rebuildCombo();
    save();
    toMenu();
  }

  // Glue the ticked sets into one chart. Rows simply follow one another, so the
  // picker shows hiragana's eleven rows, then dakuten's five, then katakana's.
  function rebuildCombo() {
    var combo = setById('combo');
    combo.chart = [];
    combo.kana = [];
    SETS.forEach(function (set) {
      if (set.isCombo || state.combo.indexOf(set.id) === -1) return;
      combo.chart = combo.chart.concat(set.chart);
      combo.kana = combo.kana.concat(set.kana);
    });
  }

  function toggleCombo(id) {
    var at = state.combo.indexOf(id);
    if (at === -1) {
      state.combo.push(id);
    } else if (state.combo.length > 1) {      // never leave it empty
      state.combo.splice(at, 1);
    }
    rebuildCombo();
    save();
    refreshMenu();
  }

  // Write runs either at random, weighted toward what you are weakest on, or
  // straight down the chart in order. The list order is just pool(), which is
  // already in chart order - switched-off characters simply drop out of it.
  function startWrite(order) {
    if (!pool().length) return;
    state.writeOrder = order;
    state.listIndex = 0;
    state.right = 0;
    state.total = 0;
    forgetRecent();
    updateScore();
    $('writeTitle').textContent = order === 'list' ? 'List' : 'Write';
    $('writePos').classList.toggle('hidden', order !== 'list');
    $('btnPrev').classList.toggle('hidden', order !== 'list');
    show('write');
    nextWrite();
    requestAnimationFrame(sizePad);
  }

  function startPractice(mode) {
    if (!pool().length) return;
    state.right = 0;
    state.total = 0;
    forgetRecent();
    updateScore();
    show(mode);
    nextRead();
  }

  function refreshMenu() {
    var on = pool().length;
    $('setName').textContent = current.name;
    $('setSample').textContent = current.sample;

    $('comboPick').classList.toggle('hidden', !current.isCombo);
    if (current.isCombo) {
      all('[data-combo]').forEach(function (b) {
        b.classList.toggle('on', state.combo.indexOf(b.dataset.combo) !== -1);
      });
    }

    var words = wordPool().length;
    $('goWords').disabled = words === 0;
    $('wordsCount').textContent = words
      ? words + ' words using only these characters'
      : 'no words available for this set';
    $('pickerCount').textContent = on + ' of ' + current.kana.length + ' characters  ·  ' +
      state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
    $('goRead').disabled = on === 0;
    $('goTrain').disabled = on === 0;
    $('goWrite').disabled = on === 0;
    $('goList').disabled = on === 0;
    $('goCopy').disabled = on === 0;
    $('goExam').disabled = on === 0;

    $('chartLinkLabel').textContent = soundOn()
      ? 'Chart · tap a character to hear it'
      : 'Chart';

    var covered = pool().filter(function (k) { return state.examSeen[k.kana]; }).length;
    $('examCoverage').textContent = on
      ? 'Identify, Write and Reading · ' + covered + ' of ' + on + ' characters examined so far'
      : 'nothing switched on';
    $('listCount').textContent = on
      ? 'Write all ' + on + ' in chart order'
      : 'nothing switched on';
    $('copyCount').textContent = on
      ? 'Trace and copy all ' + on + ' · no score'
      : 'nothing switched on';

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
    btn.addEventListener('click', function () {
      if (btn.dataset.back === 'home') { toHome(); } else { toMenu(); }
    });
  });

  all('[data-vol]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      setVolume(btn.dataset.vol);
      if (soundOn()) say('こんにちは');       // so you can hear what you picked
    });
  });

  all('[data-set]').forEach(function (btn) {
    btn.addEventListener('click', function () { chooseSet(btn.dataset.set); });
  });

  $('goWords').addEventListener('click', startWords);

  all('[data-combo]').forEach(function (btn) {
    btn.addEventListener('click', function () { toggleCombo(btn.dataset.combo); });
  });

  $('goRead').addEventListener('click', function () { startPractice('read'); });
  $('goTrain').addEventListener('click', startTrain);
  $('goWrite').addEventListener('click', function () { startWrite('random'); });
  $('goList').addEventListener('click', function () { startWrite('list'); });
  $('goCopy').addEventListener('click', startCopy);
  $('goPicker').addEventListener('click', function () { drawChart(); show('picker'); });

  // ---------- identify ----------
  function nextRead() {
    var target = pick();
    if (!target) { toMenu(); return; }
    remember(target.kana);
    presentRead(target);
  }

  // Draw one Identify question. Split out from nextRead so the exam can hand it
  // a specific character rather than letting the weighting choose.
  function presentRead(item) {
    state.locked = false;
    state.current = item;
    readKana.textContent = item.kana;
    readFeedback.textContent = '';

    var options = answerSet(item);
    choices.innerHTML = '';
    options.forEach(function (opt, i) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.dataset.romaji = opt.romaji;
      b.appendChild(document.createTextNode(opt.romaji));
      if (opt.sound) {                                 // e.g. di (ji)
        var alt = document.createElement('span');
        alt.className = 'alt';
        alt.textContent = '(' + opt.sound + ')';
        b.appendChild(alt);
      }
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

    // In an exam nothing is marked right or wrong until the end - the tapped
    // button just registers and the next question comes up.
    if (state.exam) {
      button.classList.add('picked');
      Array.prototype.forEach.call(choices.children, function (el) { el.disabled = true; });
      setTimeout(function () { examAnswer(correct); }, 170);
      return;
    }
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
      readFeedback.textContent = state.current.kana + '  is  "' + labelText(state.current) + '"';
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

  // ---------- train ----------
  // A line of characters - the train - read from left to right, typing the
  // sound of each one. Typing rather than tapping: with four buttons to choose
  // from you only have to recognise the answer, here you have to come up with
  // it yourself.
  //
  // A sound is checked when you press space or return, never letter by
  // letter. Checking as you type would give the answer away - a "k" that is
  // not marked wrong tells you the character is in the k row.
  //
  // Or, with Draw switched on, you write each sound by hand in a box. A phone
  // browser cannot read handwriting, so you check those yourself: at the end
  // of the line each drawing is shown beside the right answer, and you tap
  // any you got wrong - the same idea as Write.
  var TRAIN_LENGTH = 8;

  var TRAIN_HINT = {
    type: 'Press space after each sound. Stuck on one? Press next (or Enter) with nothing typed and it shows you.',
    draw: 'Write the sound of the outlined character, then Next. Stuck? Next with nothing written. You check them all at the end.'
  };

  // Accepted as well as the spelling the app shows. These are the other usual
  // way of writing romaji, and what a Japanese keyboard on a computer takes
  // too: し typed as "si", つ as "tu", and so on.
  var ALSO_SPELT = { shi: ['si'], chi: ['ti'], tsu: ['tu'], fu: ['hu'], ji: ['zi'], n: ['nn'] };

  var train = {
    cars: [],          // one per character: { item, el, said, typed, ink, correct }
    at: 0,             // which one is being answered
    started: 0,        // when the line appeared, for the time at the end
    secs: 0,           // how long the line took
    draw: false,       // this line is being drawn rather than typed
    done: false,       // every character answered
    settled: false,    // Draw only: your ticks and crosses have been counted
    stroke: null       // Draw only: the line being drawn right now
  };

  var trainInput = $('trainInput');

  // Every spelling that counts as right. を takes "wo" or "o", ぢ "di" or "ji".
  function answersFor(item) {
    var out = [item.romaji];
    if (item.sound) out.push(item.sound);
    out.slice().forEach(function (s) { out = out.concat(ALSO_SPELT[s] || []); });
    return out;
  }

  function startTrain() {
    if (!pool().length) return;
    state.right = 0;
    state.total = 0;
    forgetRecent();
    updateScore();
    show('train');
    newTrain();
  }

  // Characters are chosen the same way as everywhere else - weighted toward
  // what you are weak on, and never the same one within three of itself.
  function newTrain() {
    settleTrain();
    var line = $('trainLine');
    line.innerHTML = '';
    train.cars = [];
    for (var i = 0; i < TRAIN_LENGTH; i++) {
      var item = pick();
      if (!item) { toMenu(); return; }
      remember(item.kana);
      train.cars.push(makeCar(line, item));
    }
    train.at = 0;
    train.started = Date.now();
    train.done = false;
    train.settled = false;
    train.draw = state.trainDraw;
    trainInput.value = '';

    var draw = train.draw;
    $('trainForm').classList.toggle('hidden', draw);
    $('trainPad').classList.toggle('hidden', !draw);
    $('trainDrawActions').classList.toggle('hidden', !draw);
    $('trainCheck').classList.add('hidden');
    $('trainResult').classList.add('hidden');
    $('trainHint').classList.remove('hidden');
    $('trainHint').textContent = draw ? TRAIN_HINT.draw : TRAIN_HINT.type;
    markCar();
    if (draw) { requestAnimationFrame(sizeTrainPad); } else { trainInput.focus(); }
  }

  function makeCar(line, item) {
    var el = document.createElement('div');
    el.className = 'car';
    var kana = document.createElement('span');
    kana.className = 'car-kana';
    kana.textContent = item.kana;
    var said = document.createElement('span');     // what you typed, then the answer
    said.className = 'car-said';
    el.appendChild(kana);
    el.appendChild(said);
    line.appendChild(el);
    return { item: item, el: el, said: said, typed: '', ink: [], correct: false };
  }

  // Outline the one you are on. In Draw, the ones already written are faded,
  // since their answers do not show until the end.
  function markCar() {
    train.cars.forEach(function (car, i) {
      car.el.classList.toggle('now', i === train.at && !train.done);
      car.el.classList.toggle('past', train.draw && !train.done && i < train.at);
    });
    var last = train.at === train.cars.length - 1;
    $('trainDrawLabel').textContent = train.done ? 'Next train ›' : last ? 'Check ›' : 'Next ›';
  }

  // Count one answer toward your progress.
  function scoreCar(car) {
    var s = stat(car.item.kana);
    s.seen++;
    state.total++;
    if (car.correct) {
      state.right++;
      if (s.wrong > 0) s.wrong--;          // a right answer pays down the penalty
    } else {
      s.wrong++;
    }
  }

  function answerCar(typed) {
    var car = train.cars[train.at];
    car.typed = typed;
    car.correct = answersFor(car.item).indexOf(typed.toLowerCase()) !== -1;
    car.said.textContent = car.item.romaji;           // right or wrong, show the answer
    car.el.classList.add(car.correct ? 'right' : 'wrong');

    scoreCar(car);
    updateScore();
    save();

    train.at++;
    if (train.at >= train.cars.length) { finishTrain(); } else { markCar(); }
  }

  // The line stays up with every answer under it, plus the score, the time,
  // and what was typed for each one that was missed.
  function finishTrain() {
    train.done = true;
    markCar();

    var right = train.cars.filter(function (car) { return car.correct; }).length;
    var secs = (Date.now() - train.started) / 1000;
    $('trainScore').textContent = right + ' of ' + train.cars.length + ' right  ·  ' +
      secs.toFixed(1) + ' seconds';

    var missed = $('trainMissed');
    missed.innerHTML = '';
    var wrong = train.cars.filter(function (car) { return !car.correct; });
    if (wrong.length) {
      var head = document.createElement('div');
      head.className = 'exam-missed-head';
      head.textContent = 'Missed';
      missed.appendChild(head);
      wrong.forEach(function (car) {
        var note = car.typed ? 'you typed ' + car.typed : 'you skipped it';
        missed.appendChild(examRow(car.item.kana, labelText(car.item) + '  ·  ' + note, 'exam-kana'));
      });
    }

    $('trainHint').classList.add('hidden');
    $('trainResult').classList.remove('hidden');
  }

  // Everything typed comes through here. A space ends a sound, and whatever
  // follows it is the start of the next one - so "ka ki ku " answers three in
  // a row, however fast it is typed.
  //
  // The box is only rewritten when a space has actually arrived. Phone
  // keyboards build each word up as you type, and changing the box under
  // them part way through can make letters appear twice.
  trainInput.addEventListener('input', function () {
    if (state.screen !== 'train') return;
    if (train.done) { trainInput.value = ''; return; }

    var parts = trainInput.value.split(/[^A-Za-z]+/);
    var rest = parts.pop();                  // the sound still being typed
    if (parts.length) {
      parts.forEach(function (typed) {
        if (typed && !train.done) answerCar(typed);
      });
      trainInput.value = train.done ? '' : rest;
    }
    if (!train.done) train.cars[train.at].said.textContent = rest.toLowerCase();
  });

  // Return ends a sound the same as space. With nothing typed it means "I
  // don't know", which shows the answer and moves on. Once the line is
  // finished, it brings the next one.
  $('trainForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (train.done) { newTrain(); return; }
    var typed = trainInput.value.replace(/[^A-Za-z]/g, '');
    trainInput.value = '';
    answerCar(typed);
  });

  // Tapping the line brings the keyboard back if it has been put away.
  $('trainLine').addEventListener('click', function () {
    if (!train.draw) trainInput.focus();
  });
  $('trainNext').addEventListener('click', newTrain);

  // ----- train: drawing the sound -----
  // Strokes are kept as fractions of the box, the same as Copy, so the check at
  // the end can draw them again in a smaller box of the same shape.
  var trainCanvas = $('trainCanvas');

  function sizeTrainPad() {
    fitCanvas(trainCanvas);
    var car = train.cars[train.at];
    paint(trainCanvas, car && !train.done ? car.ink : []);
  }

  function clearTrainPad() {
    if (train.done) return;
    train.cars[train.at].ink = [];
    paint(trainCanvas, []);
  }

  // The big button: on to the next character, then to the check, then a new
  // line once you have checked it.
  function trainDrawNext() {
    if (train.done) { newTrain(); return; }
    train.at++;
    if (train.at >= train.cars.length) { checkDrawn(); return; }
    paint(trainCanvas, []);
    markCar();
  }

  // Each drawing beside the right answer. They start out ticked, and a tap
  // switches one to a miss and back. Anything left blank is a miss, as there
  // is nothing there that could be right.
  function checkDrawn() {
    train.done = true;
    train.secs = (Date.now() - train.started) / 1000;
    markCar();

    var box = $('trainCheck');
    box.innerHTML = '';
    var score = document.createElement('div');
    score.className = 'train-score';
    var tip = document.createElement('p');
    tip.className = 'train-hint';
    tip.textContent = 'Tap any you got wrong.';
    box.appendChild(score);
    box.appendChild(tip);

    train.cars.forEach(function (car) {
      car.correct = car.ink.length > 0;
      car.said.textContent = car.item.romaji;

      var row = document.createElement('button');
      row.className = 'check-row';
      var kana = document.createElement('span');
      kana.className = 'check-kana';
      kana.textContent = car.item.kana;
      var ink = document.createElement('span');
      ink.className = 'check-ink';
      var canvas = document.createElement('canvas');
      ink.appendChild(canvas);
      var answer = document.createElement('span');
      answer.className = 'check-answer';
      answer.textContent = labelText(car.item);
      var mark = document.createElement('span');
      mark.className = 'check-mark';
      row.appendChild(kana);
      row.appendChild(ink);
      row.appendChild(answer);
      row.appendChild(mark);
      box.appendChild(row);

      car.row = row;
      car.mark = mark;
      car.canvas = canvas;
      row.addEventListener('click', function () {
        if (!car.ink.length) return;
        car.correct = !car.correct;
        showMarks(score);
      });
    });
    showMarks(score);

    $('trainPad').classList.add('hidden');
    $('trainHint').classList.add('hidden');
    box.classList.remove('hidden');
    box.scrollTop = 0;
    requestAnimationFrame(function () {
      train.cars.forEach(function (car) {
        fitCanvas(car.canvas);
        paint(car.canvas, car.ink);
      });
    });
  }

  function showMarks(score) {
    var right = 0;
    train.cars.forEach(function (car) {
      if (car.correct) right++;
      car.el.classList.toggle('right', car.correct);
      car.el.classList.toggle('wrong', !car.correct);
      car.row.classList.toggle('wrong', !car.correct);
      car.mark.textContent = !car.ink.length ? 'blank' : car.correct ? '✓' : '✗';
    });
    score.textContent = right + ' of ' + train.cars.length + ' right  ·  ' +
      train.secs.toFixed(1) + ' seconds';
  }

  // Your ticks and crosses count toward progress once you move on - to the
  // next line, back to the menu, or to the other mode - so you can change
  // your mind about any of them until then.
  function settleTrain() {
    if (!train.draw || !train.done || train.settled) return;
    train.settled = true;
    train.cars.forEach(scoreCar);
    updateScore();
    save();
  }

  function trainPoint(e) {
    var r = trainCanvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }

  trainCanvas.addEventListener('pointerdown', function (e) {
    if (train.done) return;
    e.preventDefault();
    if (trainCanvas.setPointerCapture) { try { trainCanvas.setPointerCapture(e.pointerId); } catch (err) {} }
    var ink = train.cars[train.at].ink;
    train.stroke = [trainPoint(e)];
    ink.push(train.stroke);
    paint(trainCanvas, ink);
  });

  // Only the newest piece of line is drawn while the finger moves.
  trainCanvas.addEventListener('pointermove', function (e) {
    if (!train.stroke) return;
    e.preventDefault();
    var last = train.stroke[train.stroke.length - 1];
    var p = trainPoint(e);
    train.stroke.push(p);
    var ctx = trainCanvas.getContext('2d'), w = trainCanvas.width, h = trainCanvas.height;
    ctx.beginPath();
    ctx.moveTo(last[0] * w, last[1] * h);
    ctx.lineTo(p[0] * w, p[1] * h);
    ctx.stroke();
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
    trainCanvas.addEventListener(evt, function () { train.stroke = null; });
  });

  noEdgeSwipe(trainCanvas);

  // Type or Draw. Switching starts a fresh line; the choice is remembered.
  function setTrainDraw(on) {
    state.trainDraw = on;
    $('trainType').classList.toggle('on', !on);
    $('trainDraw').classList.toggle('on', on);
    save();
  }

  function switchTrain(on) {
    if (on === state.trainDraw) return;
    settleTrain();
    setTrainDraw(on);
    newTrain();
  }

  $('trainType').addEventListener('click', function () { switchTrain(false); });
  $('trainDraw').addEventListener('click', function () { switchTrain(true); });
  $('trainClear').addEventListener('click', clearTrainPad);
  $('trainDrawNext').addEventListener('click', trainDrawNext);

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

  // Safari takes a swipe that starts near the left edge of the screen as "go
  // back a page", and leaves the app. The writing areas are kept well in from
  // the edges for that reason (see style.css). Cancelling the touch itself is a
  // second line of defence - drawing runs on pointer events, so nothing is lost.
  function noEdgeSwipe(el) {
    try {
      el.addEventListener('touchstart', function (e) { e.preventDefault(); }, { passive: false });
    } catch (err) { /* very old browser - the margins still apply */ }
  }

  noEdgeSwipe(pad);

  function nextWrite() {
    if (state.writeOrder === 'list') {
      var seq = pool();
      if (!seq.length) { toMenu(); return; }
      if (state.listIndex >= seq.length) { showListDone(seq.length); return; }
      $('writePos').textContent = (state.listIndex + 1) + ' of ' + seq.length;
      presentWrite(seq[state.listIndex]);
    } else {
      var target = pick();
      if (!target) { toMenu(); return; }
      remember(target.kana);
      presentWrite(target);
    }
  }

  function presentWrite(item) {
    state.current = item;
    $('listDone').classList.add('hidden');
    ghost.classList.remove('show');            // hide before loading the next answer in
    writeRomaji.textContent = labelText(item);
    ghost.textContent = item.kana;
    writeActions.classList.remove('hidden');
    gradeActions.classList.add('hidden');
    clearPad();
  }

  function showListDone(total) {
    writeRomaji.textContent = 'Done';
    $('writePos').textContent = 'all ' + total + ' written';
    ghost.classList.remove('show');
    writeActions.classList.add('hidden');
    gradeActions.classList.add('hidden');
    $('listDone').classList.remove('hidden');
    clearPad();
  }

  function reveal() {
    ghost.classList.add('show');
    writeActions.classList.add('hidden');
    gradeActions.classList.remove('hidden');
  }

  function gradeWrite(correct) {
    if (state.exam) { examAnswer(correct); return; }
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
    if (state.writeOrder === 'list') state.listIndex++;
    nextWrite();
  }

  $('btnPrev').addEventListener('click', function () {
    if (state.listIndex > 0) state.listIndex--;
    nextWrite();
  });

  $('listAgain').addEventListener('click', function () {
    state.listIndex = 0;
    nextWrite();
  });

  $('btnClear').addEventListener('click', clearPad);
  $('btnReveal').addEventListener('click', reveal);
  $('btnGot').addEventListener('click', function () { gradeWrite(true); });
  $('btnMissed').addEventListener('click', function () { gradeWrite(false); });

  // ---------- copy ----------
  // Not a test - the way a first exercise book works. Two ways to use it:
  //
  //   whole row     - a row of the chart, か き く け こ, written as a line in the
  //                   big box one character after another, and the line six times
  //   one at a time - a single character, written six times
  //
  // Either way the first three goes are over a faint copy that fades each
  // time, and the last three are on your own. What you write is kept in the
  // small boxes, and at the end it is all laid out together like a finished
  // page. Nothing is scored or saved. It follows the character picker, so
  // anything switched off there is left out here too.
  var COPY_TRACE = [0.85, 0.5, 0.25, 0, 0, 0];   // how strongly each go shows the character
  var COPY_GOES = COPY_TRACE.length;

  // What you write is kept as strokes rather than as a picture, with every
  // point stored as a fraction of the box. So the same writing can be drawn
  // into the big box, a small one or the page at the end, and stays sharp at
  // every size - and turning the phone does not wipe it.
  var copy = {
    index: 0,          // which row, or which character, counting through copyUnits()
    unit: [],          // the characters being copied: a row of them, or just one
    go: 0,             // which of the six goes
    col: 0,            // which character of the row
    review: false,     // true while the finished page is showing
    ink: [],           // ink[go][col] is a list of strokes; a stroke is a list of [x, y]
    stroke: null,      // the stroke being drawn right now
    thumbs: [],        // the small boxes above the big one
    cells: []          // the boxes on the finished page
  };

  var copyCanvas = $('copyCanvas');

  // What there is to copy, in chart order: each row of the chart with the
  // characters that are switched on, or each character on its own. The rows
  // are read from the chart itself, so a row is exactly what the picker shows.
  //
  // A handful picked by hand - ぬ め ね れ わ, say - make one line wherever they
  // sit on the chart, rather than being split up by row. Six is as many as the
  // small boxes hold.
  var COPY_LINE_MAX = 6;

  function copyUnits() {
    var on = pool();
    if (!state.copyRow) return on.map(function (k) { return [k]; });
    if (on.length <= COPY_LINE_MAX) return on.length ? [on] : [];
    var units = [];
    current.chart.forEach(function (row) {
      var chars = row.cells
        .filter(function (c) { return c && !state.off[c[0]]; })
        .map(function (c) { return byKana(c[0]); });
      if (chars.length) units.push(chars);
    });
    return units;
  }

  // A row of one - ん on its own - works exactly like one at a time.
  function wholeRow() { return copy.unit.length > 1; }

  function emptyInk() {
    return COPY_TRACE.map(function () {
      return copy.unit.map(function () { return []; });
    });
  }

  // Which go and which character a small box stands for. For a row, the small
  // boxes are the characters of the line you are on; for one character, they
  // are its six goes.
  function thumbPos(i) {
    return wholeRow() ? { go: copy.go, col: i } : { go: i, col: 0 };
  }

  // A small box: the faint character behind, your writing on top. Tapping one
  // takes you to it, to write it again.
  function copyMini(parent, cls, kana, onTap) {
    var b = document.createElement('button');
    b.className = cls;
    var trace = document.createElement('div');
    trace.className = 'copy-trace';
    trace.textContent = kana;
    var canvas = document.createElement('canvas');
    b.appendChild(trace);
    b.appendChild(canvas);
    b.addEventListener('click', onTap);
    parent.appendChild(b);
    return { el: b, trace: trace, canvas: canvas };
  }

  function buildThumbs() {
    var box = $('copyThumbs');
    box.innerHTML = '';
    copy.thumbs = [];
    var count = wholeRow() ? copy.unit.length : COPY_GOES;
    for (var i = 0; i < count; i++) {
      copy.thumbs.push(makeThumb(box, i));
    }
  }

  function makeThumb(box, i) {
    return copyMini(box, 'copy-thumb', copy.unit[thumbPos(i).col].kana, function () {
      var p = thumbPos(i);
      showGo(p.go, p.col);
    });
  }

  // The finished page: one line per go for a row, or the six goes in a block
  // of three by two for a single character.
  function reviewCols() { return wholeRow() ? copy.unit.length : 3; }

  function buildCells() {
    var box = $('copyReview');
    box.innerHTML = '';
    box.style.gridTemplateColumns = 'repeat(' + reviewCols() + ', 1fr)';
    copy.cells = [];
    COPY_TRACE.forEach(function (strength, go) {
      copy.unit.forEach(function (item, col) {
        var cell = copyMini(box, 'copy-cell', item.kana, function () { showGo(go, col); });
        cell.trace.style.opacity = strength;
        cell.go = go;
        cell.col = col;
        copy.cells.push(cell);
      });
    });
  }

  // Draw a list of strokes into a canvas of any size.
  function paint(canvas, strokes) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = cssVar('--ink', '#fff');
    ctx.lineWidth = Math.max(2, w * 0.03);       // in step with the box size
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach(function (s) {
      ctx.beginPath();
      ctx.moveTo(s[0][0] * w, s[0][1] * h);
      ctx.lineTo(s[0][0] * w + 0.1, s[0][1] * h + 0.1);   // a plain tap still leaves a dot
      for (var i = 1; i < s.length; i++) ctx.lineTo(s[i][0] * w, s[i][1] * h);
      ctx.stroke();
    });
  }

  // Give a canvas as many pixels as its box has on screen, so lines are sharp.
  function fitCanvas(canvas) {
    var r = canvas.parentNode.getBoundingClientRect();
    if (!r.width) return 0;
    var scale = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * scale);
    canvas.height = Math.round(r.height * scale);
    return r.width;
  }

  // Every character is drawn at the same share of its box - the model, the
  // big box and the small ones - so the faint copy you trace over is exactly
  // the shape you were just looking at.
  function fitMini(m) {
    var w = fitCanvas(m.canvas);
    if (w) m.trace.style.fontSize = Math.round(w * 0.78) + 'px';
  }

  // The big box is the largest square that fits the space left over, and the
  // finished page is as big as it can be while still fitting. Done in code
  // rather than CSS because Safari is unreliable at sizing boxes that have to
  // fit both ways.
  function sizeCopy() {
    var model = $('copyModel').getBoundingClientRect();
    if (model.width) $('copyKana').style.fontSize = Math.round(model.width * 0.78) + 'px';

    var stage = $('copyStage').getBoundingClientRect();
    if (!stage.width) return;
    if (copy.review) {
      var cols = reviewCols(), rows = copy.cells.length / cols;
      var gap = wholeRow() ? 6 : 10;
      var cell = Math.min((stage.width - gap * (cols - 1)) / cols,
                          (stage.height - gap * (rows - 1)) / rows);
      $('copyReview').style.gap = gap + 'px';
      $('copyReview').style.width = Math.floor(cell * cols + gap * (cols - 1)) + 'px';
      copy.cells.forEach(fitMini);
    } else {
      var side = Math.floor(Math.min(stage.width, stage.height));
      $('copyPad').style.width = side + 'px';
      $('copyPad').style.height = side + 'px';
      $('copyTrace').style.fontSize = Math.round(side * 0.78) + 'px';
      fitCanvas(copyCanvas);
      copy.thumbs.forEach(fitMini);
    }
    repaintCopy();
  }

  function refreshThumbs() {
    copy.thumbs.forEach(function (t, i) {
      var p = thumbPos(i);
      // For a row the small boxes always show their character faintly, so even
      // on your own you can see what the line is.
      t.trace.style.opacity = wholeRow() ? Math.max(COPY_TRACE[p.go], 0.2) : COPY_TRACE[p.go];
      t.el.classList.toggle('now', p.go === copy.go && p.col === copy.col);
      paint(t.canvas, copy.ink[p.go][p.col]);
    });
  }

  function repaintCopy() {
    if (copy.review) {
      copy.cells.forEach(function (c) { paint(c.canvas, copy.ink[c.go][c.col]); });
      return;
    }
    paint(copyCanvas, copy.ink[copy.go][copy.col]);
    refreshThumbs();
  }

  function startCopy() {
    if (!pool().length) return;
    copy.index = 0;
    show('copy');
    presentCopy();
  }

  // Load the next row, or character, with everything empty.
  function presentCopy() {
    var units = copyUnits();
    if (!units.length) { toMenu(); return; }
    if (copy.index >= units.length) copy.index = 0;
    copy.unit = units[copy.index];
    copy.ink = emptyInk();
    copy.review = false;

    $('copyHear').classList.toggle('hidden', !soundOn());
    $('copyPos').textContent = (copy.index + 1) + ' / ' + units.length;
    $('copyPrev').disabled = copy.index === 0;
    buildThumbs();
    buildCells();
    showGo(0, 0);
    sizeCopy();
  }

  function isLastGo() {
    return copy.go === COPY_GOES - 1 && copy.col === copy.unit.length - 1;
  }

  // Put one character, on one go, in the big box.
  function showGo(go, col) {
    var fromReview = copy.review;
    var item = copy.unit[col];
    copy.go = go;
    copy.col = col;
    copy.review = false;
    state.current = item;

    $('copyPad').classList.remove('hidden');
    $('copyThumbs').classList.remove('hidden');
    $('copyReview').classList.add('hidden');

    $('copyKana').textContent = item.kana;
    $('copyRomaji').textContent = labelText(item);
    $('copyTrace').textContent = item.kana;
    $('copyTrace').style.opacity = COPY_TRACE[go];
    $('copyStep').textContent = (COPY_TRACE[go] ? 'Trace it' : 'On your own') + ' · ' +
      (wholeRow() ? 'line ' : '') + (go + 1) + ' of ' + COPY_GOES;
    $('copyLeftLabel').textContent = 'Clear';
    $('copyRightLabel').textContent = isLastGo() ? 'See the page ›' : 'Done ›';

    if (fromReview) { sizeCopy(); } else { repaintCopy(); }
  }

  // Everything you wrote, laid out together like a finished page.
  function showReview() {
    copy.review = true;
    $('copyPad').classList.add('hidden');
    $('copyThumbs').classList.add('hidden');
    $('copyReview').classList.remove('hidden');
    $('copyStep').textContent = 'All done';
    $('copyLeftLabel').textContent = 'Again';
    var more = copy.index + 1 < copyUnits().length;
    $('copyRightLabel').textContent = !more ? 'Back to the start'
      : state.copyRow ? 'Next row ›' : 'Next character ›';
    sizeCopy();
  }

  // The big button: on along the line, then to the next go, then the finished
  // page, then on to the next row or character.
  function copyRight() {
    if (copy.review) { nextCopy(); return; }
    if (isLastGo()) { showReview(); return; }
    if (copy.col < copy.unit.length - 1) {
      showGo(copy.go, copy.col + 1);
    } else {
      showGo(copy.go + 1, 0);
    }
  }

  // Clear what is in the big box - or, on the finished page, start again.
  function copyLeft() {
    if (copy.review) {
      copy.ink = emptyInk();
      showGo(0, 0);
      return;
    }
    copy.ink[copy.go][copy.col] = [];
    repaintCopy();
  }

  // Past the last one it goes back round to the first.
  function nextCopy() {
    copy.index = copy.index + 1 < copyUnits().length ? copy.index + 1 : 0;
    presentCopy();
  }

  function prevCopy() {
    if (copy.index === 0) return;
    copy.index--;
    presentCopy();
  }

  function setCopyRow(on) {
    state.copyRow = on;
    $('copyOne').classList.toggle('on', !on);
    $('copyRow').classList.toggle('on', on);
    save();
  }

  // Switching keeps your place: you land on the row holding the character you
  // were on, or on that character by itself.
  function switchCopy(on) {
    if (on === state.copyRow) return;
    var kana = state.current ? state.current.kana : null;
    setCopyRow(on);
    copy.index = 0;
    copyUnits().forEach(function (unit, i) {
      unit.forEach(function (k) { if (k.kana === kana) copy.index = i; });
    });
    presentCopy();
  }

  function copyPoint(e) {
    var r = copyCanvas.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }

  copyCanvas.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    if (copyCanvas.setPointerCapture) { try { copyCanvas.setPointerCapture(e.pointerId); } catch (err) {} }
    copy.stroke = [copyPoint(e)];
    copy.ink[copy.go][copy.col].push(copy.stroke);
    paint(copyCanvas, copy.ink[copy.go][copy.col]);
  });

  // Only the newest piece of line is drawn while the finger moves, rather
  // than repainting the whole character every time.
  copyCanvas.addEventListener('pointermove', function (e) {
    if (!copy.stroke) return;
    e.preventDefault();
    var last = copy.stroke[copy.stroke.length - 1];
    var p = copyPoint(e);
    copy.stroke.push(p);
    var ctx = copyCanvas.getContext('2d'), w = copyCanvas.width, h = copyCanvas.height;
    ctx.beginPath();
    ctx.moveTo(last[0] * w, last[1] * h);
    ctx.lineTo(p[0] * w, p[1] * h);
    ctx.stroke();
  });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
    copyCanvas.addEventListener(evt, function () {
      if (!copy.stroke) return;
      copy.stroke = null;
      refreshThumbs();             // keep the small boxes in step
    });
  });

  noEdgeSwipe(copyCanvas);

  // Same as tapping a character on the chart - nothing here is being tested,
  // so hearing it gives nothing away.
  $('copyModel').addEventListener('click', function () {
    if (state.current) say(state.current.kana);
  });
  $('copyNext').addEventListener('click', nextCopy);
  $('copyPrev').addEventListener('click', prevCopy);
  $('copyLeft').addEventListener('click', copyLeft);
  $('copyRight').addEventListener('click', copyRight);
  $('copyOne').addEventListener('click', function () { switchCopy(false); });
  $('copyRow').addEventListener('click', function () { switchCopy(true); });

  // ---------- character picker ----------
  var chart = $('chart');
  var refs = { rows: [], cols: [], cells: {} };

  // How much of a line is switched on: all of it, some of it, or none.
  function lineState(cells) {
    var real = cells.filter(Boolean);
    var on = real.filter(function (c) { return !state.off[c[0]]; }).length;
    if (on === 0) return 'none';
    return on === real.length ? 'all' : 'some';
  }

  function rowCells(row) { return row.cells; }
  function colCells(rows, i) { return rows.map(function (r) { return r.cells[i]; }); }

  // The chart is drawn as one or more blocks. An ordinary set is a single
  // unlabelled block; the combination set is one labelled block per ticked set,
  // so its rows do not run together and each block gets its own column toggles.
  function chartBlocks() {
    if (!current.isCombo) return [{ title: null, rows: current.chart }];
    var blocks = [];
    SETS.forEach(function (set) {
      if (set.isCombo || state.combo.indexOf(set.id) === -1) return;
      blocks.push({ title: set.name, rows: set.chart });
    });
    return blocks;
  }

  function groupHeading(title) {
    var h = document.createElement('div');
    h.className = 'chart-group';
    h.textContent = title;
    return h;
  }

  function makeHead(kind, label, cells, onTap) {
    var b = document.createElement('button');
    b.className = kind + ' ' + lineState(cells);
    var text = document.createElement('span');
    text.textContent = label;
    var pip = document.createElement('span');
    pip.className = 'pip';
    b.appendChild(text);
    b.appendChild(pip);
    b.addEventListener('click', onTap);
    return b;
  }

  // Tapping a row or column switches all of it on, unless it is already
  // entirely on - then it switches all of it off. A half-on line fills up,
  // which is what you usually want mid-way through picking.
  function toggleLine(cells) {
    var turnOn = lineState(cells) !== 'all';
    cells.forEach(function (c) {
      if (!c) return;
      if (turnOn) { delete state.off[c[0]]; } else { state.off[c[0]] = true; }
    });
    save();
    refreshChart();
  }

  // Repaint the on/off states without rebuilding the whole grid.
  function refreshChart() {
    current.kana.forEach(function (k) {
      var cell = refs.cells[k.kana];
      if (cell) cell.className = 'cell ' + (state.off[k.kana] ? 'off' : 'on');
    });
    refs.rows.forEach(function (r) {
      r.el.className = 'row-head ' + lineState(rowCells(r.row));
    });
    refs.cols.forEach(function (c) {
      c.el.className = 'col-head ' + lineState(colCells(c.rows, c.index));
    });
    updatePickerFoot();
  }

  function drawChart() {
    chart.innerHTML = '';
    refs = { rows: [], cols: [], cells: {} };

    chartBlocks().forEach(function (block) {
      if (block.title) chart.appendChild(groupHeading(block.title));

      // header: an empty corner, then a button per vowel column of this block
      chart.appendChild(document.createElement('div'));
      VOWELS.forEach(function (v, i) {
        var h = makeHead('col-head', v, colCells(block.rows, i), function () {
          toggleLine(colCells(block.rows, i));
        });
        refs.cols.push({ el: h, rows: block.rows, index: i });
        chart.appendChild(h);
      });

      block.rows.forEach(function (row) {
      var head = makeHead('row-head', row.label, rowCells(row), function () { toggleLine(rowCells(row)); });
      refs.rows.push({ el: head, row: row });
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
          save();
          refreshChart();
        });

          refs.cells[kana] = b;
          chart.appendChild(b);
        });
      });
    });

    updatePickerFoot();
  }

  // ---------- reference chart ----------
  // The same grid as the picker, but read-only: a place to re-ground yourself
  // part way through a drill. Opening it abandons the current question rather
  // than scoring it, so it cannot be used to look up the answer on screen.
  function drawReference() {
    var grid = $('refChart');
    grid.innerHTML = '';

    chartBlocks().forEach(function (block) {
      if (block.title) grid.appendChild(groupHeading(block.title));

      grid.appendChild(document.createElement('div'));
      VOWELS.forEach(function (v) {
        var h = document.createElement('div');
        h.className = 'col-head';
        h.textContent = v;
        grid.appendChild(h);
      });

      block.rows.forEach(function (row) {
      var head = document.createElement('div');
      head.className = 'row-head';
      head.textContent = row.label;
      grid.appendChild(head);

      row.cells.forEach(function (cell) {
        if (!cell) {
          var blank = document.createElement('div');
          blank.className = 'cell-blank';
          grid.appendChild(blank);
          return;
        }
          // A button rather than a plain cell: the reference chart is read-only,
          // so a tap is free to mean "say this one".
          var box = document.createElement('button');
          box.className = 'cell ' + (state.off[cell[0]] ? 'off' : 'on');
          box.dataset.kana = cell[0];

          var k = document.createElement('span');
          k.className = 'c-kana';
          k.textContent = cell[0];
          var r = document.createElement('span');
          r.className = 'c-romaji';
          r.textContent = cell[1];
          box.appendChild(k);
          box.appendChild(r);

          (function (kana) {
            box.addEventListener('click', function () { say(kana); });
          }(cell[0]));

          grid.appendChild(box);
        });
      });
    });
  }

  function openChart() {
    state.chartFrom = state.screen;
    $('refTitle').textContent = current.name + ' chart';
    $('refHint').textContent = soundOn()
      ? 'Tap a character to hear it. Switched-off characters are shown with a dashed outline.'
      : 'Everything currently being tested. Switched-off characters are shown with a dashed outline.';
    drawReference();
    show('reference');
  }

  // Coming back starts a fresh question - the one that was on screen is dropped,
  // neither right nor wrong.
  function closeChart() {
    if (state.chartFrom === 'menu') {
      toMenu();
      return;
    }
    if (state.chartFrom === 'write') {
      show('write');
      nextWrite();
      requestAnimationFrame(sizePad);
    } else if (state.chartFrom === 'train') {
      show('train');
      newTrain();
    } else {
      show('read');
      nextRead();
    }
  }

  all('[data-chart]').forEach(function (btn) {
    btn.addEventListener('click', openChart);
  });

  $('refClose').addEventListener('click', closeChart);
  $('refBack').addEventListener('click', closeChart);

  function updatePickerFoot() {
    $('pickerFoot').textContent = pool().length + ' of ' + current.kana.length + ' on';
  }

  var DIFFICULTY_NOTE = {
    easy: 'Wrong answers come from the same row as the character shown, so a question about く is answered against か き け こ.',
    medium: 'Wrong answers come from anywhere you have switched on, so three rows means all three rows are in play.',
    hard: 'Wrong answers can be any character in this set, including rows you have switched off.'
  };

  function setDifficulty(level) {
    if (!DIFFICULTY_NOTE[level]) level = 'easy';
    state.difficulty = level;
    $('diffEasy').classList.toggle('on', level === 'easy');
    $('diffMed').classList.toggle('on', level === 'medium');
    $('diffHard').classList.toggle('on', level === 'hard');
    $('diffNote').textContent = DIFFICULTY_NOTE[level];
    save();
  }

  $('diffEasy').addEventListener('click', function () { setDifficulty('easy'); });
  $('diffMed').addEventListener('click', function () { setDifficulty('medium'); });
  $('diffHard').addEventListener('click', function () { setDifficulty('hard'); });

  $('pickAll').addEventListener('click', function () {
    state.off = {};
    save();
    refreshChart();
  });

  $('pickNone').addEventListener('click', function () {
    current.kana.forEach(function (k) { state.off[k.kana] = true; });
    save();
    refreshChart();
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



  // ---------- saying a word out loud ----------
  // The browser's own speech synthesis. Nothing to host, nothing to license, and
  // it works offline - iOS ships Japanese voices, so a phone reads kana properly.
  // Where no speech support exists at all, the controls simply do not appear.
  var speech = {
    ok: false,
    voice: null
  };

  try {
    speech.ok = !!(window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function');
  } catch (e) {
    speech.ok = false;
  }

  function chooseVoice() {
    if (!speech.ok) return;
    var voices = [];
    try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; }
    for (var i = 0; i < voices.length; i++) {
      if (/^ja\b/i.test(voices[i].lang) || /^ja[-_]/i.test(voices[i].lang)) {
        speech.voice = voices[i];
        return;
      }
    }
  }

  if (speech.ok) {
    chooseVoice();
    // the voice list often arrives after the page does
    try { window.speechSynthesis.onvoiceschanged = chooseVoice; } catch (e) {}
  }

  // Kana is already phonetic, so the word itself is what gets spoken. Slightly
  // slower than normal - a learner needs to hear the individual sounds.
  //
  // Two things stop the start being clipped, which is very audible on a single
  // vowel like あ:
  //
  //   1. A silent utterance is queued first. The audio session takes a moment to
  //      open, and whatever is playing while it does gets swallowed - so let it
  //      swallow silence instead of the first half of the answer.
  //   2. Cancelling and speaking in the same tick drops or truncates the new
  //      utterance on several engines, so a cancel is given a moment to land.
  // The default voice is shrill and runs at full volume, which is painful on a
  // phone held close. Pitch is the lever for the sharpness, volume for the rest;
  // both sit below their defaults of 1.
  // Every sound in the app is spoken through utter(), so this one setting is the
  // only thing that decides how loud anything is.
  var VOLUMES = { off: 0, low: 0.3, mid: 0.6, high: 1 };

  function volumeLevel() {
    return typeof VOLUMES[state.volume] === 'number' ? VOLUMES[state.volume] : VOLUMES.mid;
  }

  function soundOn() { return speech.ok && volumeLevel() > 0; }

  // Hiding the button when sound is off left no clue why nothing happened, so
  // it stays visible and says what is wrong.
  function setListenButton(btn) {
    btn.classList.toggle('hidden', !speech.ok);
    btn.classList.toggle('listen-off', !soundOn());
    btn.textContent = soundOn() ? '♪ listen' : '♪ sound is off';
  }

  function setVolume(level) {
    if (typeof VOLUMES[level] !== 'number') level = 'mid';
    state.volume = level;
    all('[data-vol]').forEach(function (b) {
      b.classList.toggle('on', b.dataset.vol === level);
    });
    $('volumeWrap').classList.toggle('hidden', !speech.ok);
    save();
  }

  function utter(text, volume) {
    var u = new window.SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    if (speech.voice) u.voice = speech.voice;
    u.rate = 0.85;
    u.pitch = 0.9;
    u.volume = (typeof volume === 'number') ? volume : volumeLevel();
    return u;
  }

  // The very first speak of a page's life is often dropped outright, which is why
  // a listen button can need tapping twice. Opening the session on the first
  // touch anywhere in the app means it is already warm by the time you ask for
  // audio. Silent, so nothing is heard.
  var speechPrimed = false;

  function primeSpeech() {
    if (!speech.ok || speechPrimed) return;
    speechPrimed = true;
    try { window.speechSynthesis.speak(utter(' ', 0)); } catch (e) {}
  }

  if (speech.ok) {
    try {
      document.addEventListener('pointerdown', primeSpeech, true);
      document.addEventListener('click', primeSpeech, true);
    } catch (e) {}
  }

  function say(text) {
    if (!soundOn() || !text) return;
    if (!speech.voice) chooseVoice();          // voices often arrive late on a phone
    primeSpeech();

    // A lone character gives the synthesiser no room and it starts rendering
    // part way through the vowel - あ is the worst of them. A pause character
    // inside the utterance gives it something to begin on. Words are long
    // enough already, so they are left exactly as they are.
    var phrase = Array.prototype.slice.call(text).length === 1 ? '、' + text : text;

    try {
      var speakIt = function () {
        // Browsers pause the speech engine when the page is idle or in the
        // background, and it stays paused - which looks exactly like audio
        // having stopped working. Resuming costs nothing when it is not paused.
        try { window.speechSynthesis.resume(); } catch (e) {}
        window.speechSynthesis.speak(utter(' ', 0));   // warm the audio session
        window.speechSynthesis.speak(utter(phrase));
      };

      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setTimeout(speakIt, 80);
      } else {
        speakIt();
      }
    } catch (e) { /* not worth interrupting practice over */ }
  }

  // ---------- words ----------
  // A word "needs dakuten" if any of its characters carries a ゛ or ゜ mark. That
  // is worked out from the dakuten set rather than tagged by hand in words.js.
  // A word belongs to a set when every one of its characters is taught by that
  // set. Dakuten is the exception: its words are written with ordinary hiragana
  // too, so what counts is that at least one character carries a mark.
  function wordPool() {
    var allowed = {};
    current.kana.forEach(function (k) { allowed[k.kana] = true; });

    var required = null;
    if (current.id === 'dakuten') {
      required = dakutenChars;
      setById('hiragana').kana.forEach(function (k) { allowed[k.kana] = true; });
    }

    return WORDS.filter(function (w) {
      var hasRequired = !required;
      for (var i = 0; i < w.kana.length; i++) {
        var c = w.kana.charAt(i);
        if (!allowed[c]) return false;
        if (required && required[c]) hasRequired = true;
      }
      return hasRequired;
    });
  }

  // Words are weighted and de-repeated exactly like characters.
  function pickWord() {
    return pickFrom(wordPool(), kanaKey);
  }

  function startWords() {
    if (!wordPool().length) return;
    state.right = 0;
    state.total = 0;
    forgetRecent();
    updateScore();
    $('wordsTitle').textContent = current.name + ' words';
    show('words');
    nextWord();
  }

  function nextWord() {
    var word = pickWord();
    if (!word) { toHome(); return; }
    remember(word.kana);
    presentWord(word);
  }

  function presentWord(item) {
    state.current = item;
    $('wordKana').textContent = item.kana;
    // the romaji chip is ignored during an exam - the reading is the question
    $('wordRomaji').textContent = (state.wordRomaji && !state.exam) ? item.romaji : '';
    $('wordMeaning').textContent = '';
    $('wordActions').classList.remove('hidden');
    $('wordGrade').classList.add('hidden');
    $('wListen').classList.add('hidden');
  }

  function revealWord() {
    $('wordRomaji').textContent = state.current.romaji;
    $('wordMeaning').textContent = state.current.meaning;
    $('wordActions').classList.add('hidden');
    $('wordGrade').classList.remove('hidden');
    setListenButton($('wListen'));
    say(state.current.kana);
  }

  function gradeWord(correct) {
    if (state.exam) { examAnswer(correct); return; }
    var st = stat(state.current.kana);
    st.seen++;
    state.total++;
    if (correct) {
      state.right++;
      if (st.wrong > 0) st.wrong--;
    } else {
      st.wrong++;
    }
    updateScore();
    save();
    nextWord();
  }

  // Both chips show their state by lighting up rather than by changing their
  // wording, which keeps the bar from crowding on a narrow phone.
  function setWordRomaji(on) {
    state.wordRomaji = on;
    $('wRomaji').classList.toggle('on-chip', on);
    save();
  }

  $('wReveal').addEventListener('click', revealWord);
  $('wGot').addEventListener('click', function () { gradeWord(true); });
  $('wMissed').addEventListener('click', function () { gradeWord(false); });

  $('wListen').addEventListener('click', function () {
    if (state.current) say(state.current.kana);
  });

  $('wRomaji').addEventListener('click', function () {
    setWordRomaji(!state.wordRomaji);
    // if the answer is already showing, leave it showing
    if ($('wordGrade').classList.contains('hidden')) {
      $('wordRomaji').textContent = state.wordRomaji ? state.current.romaji : '';
    }
  });


  // ---------- exam ----------
  // An exam is deliberately unlike practice. Fixed length, no weighting toward
  // your weak spots, no feedback until the end, and no reference chart. Three
  // parts: Identify, Write, Reading.
  var EXAM_SIZE = { read: 10, write: 10, words: 5 };

  // Choosing what to test. Items the current round of exams has not covered yet
  // come first, so a few exams sweep the whole set rather than asking the same
  // characters every time. When everything has been covered the round restarts.
  // `prefix` keeps characters and words in separate namespaces. Some words are a
  // single character - き is "tree", て is "hand" - so without it, reading the
  // word き would count as having examined the character き.
  function examPick(list, n, prefix) {
    if (!list.length) return [];
    var key = function (it) { return prefix + it.kana; };

    var unseen = list.filter(function (it) { return !state.examSeen[key(it)]; });
    if (!unseen.length) {
      list.forEach(function (it) { delete state.examSeen[key(it)]; });
      unseen = list.slice();
    }

    var chosen = shuffle(unseen.slice()).slice(0, n);
    if (chosen.length < n) {
      var already = list.filter(function (it) { return chosen.indexOf(it) === -1; });
      chosen = chosen.concat(shuffle(already).slice(0, n - chosen.length));
    }
    chosen.forEach(function (it) { state.examSeen[key(it)] = true; });
    return chosen;
  }

  function startExam() {
    var chars = pool();
    if (!chars.length) return;

    var parts = [];
    var readItems = examPick(chars, EXAM_SIZE.read, '');
    if (readItems.length) parts.push({ mode: 'read', label: 'Identify', items: readItems });

    var writeItems = examPick(chars, EXAM_SIZE.write, '');
    if (writeItems.length) parts.push({ mode: 'write', label: 'Write', items: writeItems });

    var wordItems = examPick(wordPool(), EXAM_SIZE.words, 'w:');
    if (wordItems.length) parts.push({ mode: 'words', label: 'Reading', items: wordItems });

    if (!parts.length) return;

    state.exam = {
      parts: parts,
      p: 0,
      i: 0,
      done: 0,
      total: parts.reduce(function (n, part) { return n + part.items.length; }, 0),
      results: {},
      missed: []
    };
    parts.forEach(function (part) {
      state.exam.results[part.mode] = { right: 0, total: part.items.length, label: part.label };
    });

    setExamChrome(true);
    save();
    examShow();
  }

  // The chart button, the list controls and the romaji chip all have to go -
  // they would each hand you an answer.
  function setExamChrome(on) {
    all('[data-chart]').forEach(function (b) { b.classList.toggle('hidden', on); });
    $('wRomaji').classList.toggle('hidden', on);
    $('btnPrev').classList.toggle('hidden', on || state.writeOrder !== 'list');
    $('writePos').classList.toggle('hidden', on || state.writeOrder !== 'list');
  }

  function endExam() {
    if (!state.exam) return;
    state.exam = null;
    setExamChrome(false);
    $('readTitle').textContent = 'Identify';
    $('writeTitle').textContent = 'Write';
    $('wordsTitle').textContent = 'Words';
  }

  function examShow() {
    var ex = state.exam;
    if (!ex) return;

    if (ex.p >= ex.parts.length) { showExamResult(); return; }
    var part = ex.parts[ex.p];
    if (ex.i >= part.items.length) { ex.p++; ex.i = 0; examShow(); return; }

    var item = part.items[ex.i];
    all('.js-right').forEach(function (el) { el.textContent = ex.done + 1; });
    all('.js-total').forEach(function (el) { el.textContent = ex.total; });

    if (part.mode === 'read') {
      $('readTitle').textContent = 'Exam · Identify';
      show('read');
      presentRead(item);
    } else if (part.mode === 'write') {
      $('writeTitle').textContent = 'Exam · Write';
      show('write');
      presentWrite(item);
      requestAnimationFrame(sizePad);
    } else {
      $('wordsTitle').textContent = 'Exam · Reading';
      show('words');
      presentWord(item);
    }
  }

  function examAnswer(correct) {
    var ex = state.exam;
    if (!ex) return;

    var part = ex.parts[ex.p];
    var item = part.items[ex.i];
    var st = stat(item.kana);
    st.seen++;

    if (correct) {
      ex.results[part.mode].right++;
      if (st.wrong > 0) st.wrong--;
    } else {
      st.wrong++;
      ex.missed.push({
        kana: item.kana,
        label: item.meaning ? item.romaji + ' - ' + item.meaning : labelText(item),
        part: part.label
      });
    }

    ex.done++;
    ex.i++;
    save();
    examShow();
  }

  function examRow(left, right, leftClass) {
    var row = document.createElement('div');
    row.className = 'exam-row';
    var a = document.createElement('span');
    if (leftClass) a.className = leftClass;
    a.textContent = left;
    var b = document.createElement(leftClass ? 'span' : 'b');
    if (leftClass) b.className = 'exam-label';
    b.textContent = right;
    row.appendChild(a);
    row.appendChild(b);
    return row;
  }

  function showExamResult() {
    var ex = state.exam;
    var right = 0;
    ex.parts.forEach(function (part) { right += ex.results[part.mode].right; });

    $('examScore').textContent = right;
    $('examTotal').textContent = ex.total;

    var breakdown = $('examBreakdown');
    breakdown.innerHTML = '';
    ex.parts.forEach(function (part) {
      var r = ex.results[part.mode];
      breakdown.appendChild(examRow(r.label, r.right + ' / ' + r.total));
    });

    var missed = $('examMissed');
    missed.innerHTML = '';
    if (!ex.missed.length) {
      var clean = document.createElement('div');
      clean.className = 'exam-clean';
      clean.textContent = 'Nothing missed.';
      missed.appendChild(clean);
    } else {
      var head = document.createElement('div');
      head.className = 'exam-missed-head';
      head.textContent = 'Missed';
      missed.appendChild(head);
      ex.missed.forEach(function (m) {
        missed.appendChild(examRow(m.kana, m.label + '  ·  ' + m.part, 'exam-kana'));
      });
    }

    state.exam = null;
    setExamChrome(false);
    $('readTitle').textContent = 'Identify';
    $('writeTitle').textContent = 'Write';
    $('wordsTitle').textContent = 'Words';
    save();
    show('exam');
  }

  $('goChart').addEventListener('click', function () { drawReference(); openChart(); });
  $('goExam').addEventListener('click', startExam);
  $('examAgain').addEventListener('click', startExam);


  // ---------- sentences ----------
  // Where words stop and Japanese starts. The particles - は を に が の も と で -
  // carry no meaning on their own; they mark what job each word is doing. They
  // are picked out in colour once the answer is showing.
  function sentenceKey(item) { return 's:' + item.parts.join(''); }

  function startSentences() {
    if (!SENTENCES.length) return;
    state.right = 0;
    state.total = 0;
    forgetRecent();
    updateScore();
    show('sentence');
    nextSentence();
  }

  function nextSentence() {
    var item = pickFrom(SENTENCES, sentenceKey);
    if (!item) { toHome(); return; }
    remember(sentenceKey(item));
    presentSentence(item);
  }

  function presentSentence(item) {
    state.current = item;
    $('sentenceKana').textContent = item.parts.join('');
    $('sentenceKana').classList.remove('hidden');
    $('sentenceParts').classList.add('hidden');
    $('sentenceParts').innerHTML = '';
    $('sentenceRomaji').textContent = '';
    $('sentenceMeaning').textContent = '';
    $('sentenceNote').textContent = '';
    $('sListen').classList.add('hidden');
    $('sentenceActions').classList.remove('hidden');
    $('sentenceGrade').classList.add('hidden');
  }

  function revealSentence() {
    var item = state.current;

    // the same characters, now split into words - that gap is what you were
    // trying to find while reading it
    var box = $('sentenceParts');
    box.innerHTML = '';
    item.parts.forEach(function (part) {
      var isParticle = PARTICLES.indexOf(part) !== -1;

      var col = document.createElement('span');
      col.className = 'part-col';
      col.dataset.kana = part;

      var kana = document.createElement('span');
      kana.className = isParticle ? 'part part-particle' : 'part';
      kana.textContent = part;

      // what this one word means, so the sentence can be read piece by piece
      var gloss = document.createElement('span');
      gloss.className = isParticle ? 'part-gloss part-gloss-particle' : 'part-gloss';
      gloss.textContent = GLOSS[part] || '';

      col.appendChild(kana);
      col.appendChild(gloss);
      box.appendChild(col);
    });
    $('sentenceKana').classList.add('hidden');
    box.classList.remove('hidden');

    $('sentenceRomaji').textContent = item.romaji;
    $('sentenceMeaning').textContent = item.meaning;
    $('sentenceNote').textContent = item.note || '';
    setListenButton($('sListen'));
    $('sentenceActions').classList.add('hidden');
    $('sentenceGrade').classList.remove('hidden');
    say(item.parts.join(''));
  }

  function gradeSentence(correct) {
    var st = stat(sentenceKey(state.current));
    st.seen++;
    state.total++;
    if (correct) {
      state.right++;
      if (st.wrong > 0) st.wrong--;
    } else {
      st.wrong++;
    }
    updateScore();
    save();
    nextSentence();
  }

  $('sReveal').addEventListener('click', revealSentence);
  $('sGot').addEventListener('click', function () { gradeSentence(true); });
  $('sMissed').addEventListener('click', function () { gradeSentence(false); });
  $('sListen').addEventListener('click', function () {
    if (state.current && state.current.parts) say(state.current.parts.join(''));
  });

  all('[data-sentences]').forEach(function (btn) {
    btn.addEventListener('click', startSentences);
  });

  // ---------- keyboard (desktop) ----------
  document.addEventListener('keydown', function (e) {
    if (state.screen === 'home') return;
    if (state.screen === 'menu') {
      if (e.key === 'Escape') toHome();
      return;
    }
    if (state.screen === 'picker') {
      if (e.key === 'Escape') toMenu();
      return;
    }
    if (state.screen === 'reference') {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeChart(); }
      return;
    }
    if (state.screen === 'sentence') {
      if (e.key === 'Escape') { toHome(); return; }
      var revealed = !$('sentenceGrade').classList.contains('hidden');
      if (!revealed && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); revealSentence(); }
      else if (revealed && (e.key === 'y' || e.key === 'ArrowRight' || e.key === 'Enter')) { e.preventDefault(); gradeSentence(true); }
      else if (revealed && (e.key === 'n' || e.key === 'ArrowLeft')) { e.preventDefault(); gradeSentence(false); }
      return;
    }
    if (state.screen === 'train') {
      if (e.key === 'Escape') { toMenu(); return; }
      if (train.draw) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); trainDrawNext(); }
        else if (e.key === 'c') { e.preventDefault(); clearTrainPad(); }
        return;
      }
      // After a click somewhere else on a desktop, typing still goes in the box.
      if (document.activeElement !== trainInput && e.key.length === 1) trainInput.focus();
      return;
    }
    if (state.screen === 'copy') {
      if (e.key === 'Escape') { toMenu(); return; }
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); copyRight(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nextCopy(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prevCopy(); }
      else if (e.key === 'c' && !copy.review) { e.preventDefault(); copyLeft(); }
      return;
    }
    if (state.screen === 'words') {
      if (e.key === 'Escape') { toMenu(); return; }
      var shown = !$('wordGrade').classList.contains('hidden');
      if (!shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); revealWord(); }
      else if (shown && (e.key === 'y' || e.key === 'ArrowRight' || e.key === 'Enter')) { e.preventDefault(); gradeWord(true); }
      else if (shown && (e.key === 'n' || e.key === 'ArrowLeft')) { e.preventDefault(); gradeWord(false); }
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
    if (state.screen === 'copy') sizeCopy();
    if (state.screen === 'train' && train.draw) sizeTrainPad();
  });

  window.addEventListener('orientationchange', function () {
    setTimeout(function () {
      if (state.screen === 'write') sizePad();
      if (state.screen === 'copy') sizeCopy();
      if (state.screen === 'train' && train.draw) sizeTrainPad();
    }, 250);
  });

  load();
  rebuildCombo();
  setDifficulty(state.difficulty);
  setWordRomaji(state.wordRomaji);
  setVolume(state.volume);
  setCopyRow(state.copyRow);
  setTrainDraw(state.trainDraw);
  updateScore();
  toHome();
})();
