// The gojuon chart. Columns are the vowels a i u e o, and each row is one
// consonant line - `label` is that consonant. The vowel row has no consonant so
// it is shown as a dash. null marks a slot that does not exist - there is no
// "yi", so that cell is simply blank on the chart.
var VOWELS = ['a', 'i', 'u', 'e', 'o'];

var HIRAGANA = [
  { id: 'a',  label: '–', cells: [['あ','a'],   ['い','i'],   ['う','u'],   ['え','e'],   ['お','o']] },
  { id: 'k',  label: 'k', cells: [['か','ka'],  ['き','ki'],  ['く','ku'],  ['け','ke'],  ['こ','ko']] },
  { id: 's',  label: 's', cells: [['さ','sa'],  ['し','shi'], ['す','su'],  ['せ','se'],  ['そ','so']] },
  { id: 't',  label: 't', cells: [['た','ta'],  ['ち','chi'], ['つ','tsu'], ['て','te'],  ['と','to']] },
  { id: 'n',  label: 'n', cells: [['な','na'],  ['に','ni'],  ['ぬ','nu'],  ['ね','ne'],  ['の','no']] },
  { id: 'h',  label: 'h', cells: [['は','ha'],  ['ひ','hi'],  ['ふ','fu'],  ['へ','he'],  ['ほ','ho']] },
  { id: 'm',  label: 'm', cells: [['ま','ma'],  ['み','mi'],  ['む','mu'],  ['め','me'],  ['も','mo']] },
  { id: 'y',  label: 'y', cells: [['や','ya'],  null,         ['ゆ','yu'],  null,         ['よ','yo']] },
  { id: 'r',  label: 'r', cells: [['ら','ra'],  ['り','ri'],  ['る','ru'],  ['れ','re'],  ['ろ','ro']] },
  { id: 'w',  label: 'w', cells: [['わ','wa'],  null,         null,         null,         ['を','wo','o']] },
  { id: 'nn', label: 'n', cells: [['ん','n'],   null,         null,         null,         null] }
];

// The same characters carrying a dakuten (two small strokes) or, on the last
// row, a handakuten (a small circle). The mark changes the sound: か ka becomes
// が ga, は ha becomes ば ba, and は ha becomes ぱ pa.
//
// A note on ぢ and づ: in everyday romaji these are written "ji" and "zu", the
// same as じ and ず, because they sound the same in modern Japanese. Spelling
// them "di" and "du" here keeps every prompt in the app unambiguous, and it is
// how they are written in the kunrei system. They are rare in real words.
var DAKUTEN = [
  { id: 'g', label: 'g', cells: [['が','ga'], ['ぎ','gi'], ['ぐ','gu'], ['げ','ge'], ['ご','go']] },
  { id: 'z', label: 'z', cells: [['ざ','za'], ['じ','ji'], ['ず','zu'], ['ぜ','ze'], ['ぞ','zo']] },
  { id: 'd', label: 'd', cells: [['だ','da'], ['ぢ','di','ji'], ['づ','du','zu'], ['で','de'], ['ど','do']] },
  { id: 'b', label: 'b', cells: [['ば','ba'], ['び','bi'], ['ぶ','bu'], ['べ','be'], ['ぼ','bo']] },
  { id: 'p', label: 'p', cells: [['ぱ','pa'], ['ぴ','pi'], ['ぷ','pu'], ['ぺ','pe'], ['ぽ','po']] }
];

// A cell is [character, romaji, sound]. The third value is optional and only
// given where the spelling does not match the pronunciation. The app shows these
// as "written (sounds like)" - ぢ appears as "di (ji)" and を as "wo (o)".

// Katakana: the same 46 sounds as hiragana, different shapes. Used for words
// borrowed from other languages, foreign names, and sound effects.
var KATAKANA = [
  { id: 'a',  label: '–', cells: [['ア','a'],   ['イ','i'],   ['ウ','u'],   ['エ','e'],   ['オ','o']] },
  { id: 'k',  label: 'k', cells: [['カ','ka'],  ['キ','ki'],  ['ク','ku'],  ['ケ','ke'],  ['コ','ko']] },
  { id: 's',  label: 's', cells: [['サ','sa'],  ['シ','shi'], ['ス','su'],  ['セ','se'],  ['ソ','so']] },
  { id: 't',  label: 't', cells: [['タ','ta'],  ['チ','chi'], ['ツ','tsu'], ['テ','te'],  ['ト','to']] },
  { id: 'n',  label: 'n', cells: [['ナ','na'],  ['ニ','ni'],  ['ヌ','nu'],  ['ネ','ne'],  ['ノ','no']] },
  { id: 'h',  label: 'h', cells: [['ハ','ha'],  ['ヒ','hi'],  ['フ','fu'],  ['ヘ','he'],  ['ホ','ho']] },
  { id: 'm',  label: 'm', cells: [['マ','ma'],  ['ミ','mi'],  ['ム','mu'],  ['メ','me'],  ['モ','mo']] },
  { id: 'y',  label: 'y', cells: [['ヤ','ya'],  null,         ['ユ','yu'],  null,         ['ヨ','yo']] },
  { id: 'r',  label: 'r', cells: [['ラ','ra'],  ['リ','ri'],  ['ル','ru'],  ['レ','re'],  ['ロ','ro']] },
  { id: 'w',  label: 'w', cells: [['ワ','wa'],  null,         null,         null,         ['ヲ','wo','o']] },
  { id: 'nn', label: 'n', cells: [['ン','n'],   null,         null,         null,         null] }
];

// Turn a chart into a flat list of { kana, romaji, sound, row }.
function flattenChart(chart) {
  var out = [];
  chart.forEach(function (row) {
    row.cells.forEach(function (cell) {
      if (cell) out.push({ kana: cell[0], romaji: cell[1], sound: cell[2] || null, row: row.id });
    });
  });
  return out;
}

// The sets offered on the opening screen. Adding katakana later means adding
// one more entry here - nothing else in the app needs to know about it.
var SETS = [
  {
    id: 'hiragana',
    name: 'Hiragana',
    sample: 'あ い う え お',
    blurb: 'The 46 basic characters',
    chart: HIRAGANA
  },
  {
    id: 'dakuten',
    name: 'Dakuten',
    sample: 'が ざ だ ば ぱ',
    blurb: '25 hiragana carrying ゛ or ゜',
    chart: DAKUTEN
  },
  {
    id: 'katakana',
    name: 'Katakana',
    sample: 'ア イ ウ エ オ',
    blurb: 'The same 46 sounds, for foreign words',
    chart: KATAKANA
  }
];

SETS.forEach(function (set) { set.kana = flattenChart(set.chart); });

function setById(id) {
  for (var i = 0; i < SETS.length; i++) {
    if (SETS[i].id === id) return SETS[i];
  }
  return SETS[0];
}

// Characters that look alike - used to make the wrong answers actually tricky.
// Groups may mix sets; anything outside the set being practised is ignored.
var LOOKALIKES = [
  ['あ','お','む'],
  ['い','り'],
  ['う','つ','ら'],
  ['き','さ','ち'],
  ['く','へ'],
  ['こ','に'],
  ['け','は','ほ','ま'],
  ['す','む','お'],
  ['せ','さ'],
  ['そ','ろ','る'],
  ['ぬ','め','あ'],
  ['ね','れ','わ'],
  ['た','な'],
  ['し','つ','て'],
  ['ま','も'],
  ['や','ゆ'],
  ['ん','そ','れ'],
  // the dakuten set: telling ゛ from ゜ is the whole difficulty
  ['ば','ぱ'],
  ['び','ぴ'],
  ['ぶ','ぷ'],
  ['べ','ぺ'],
  ['ぼ','ぽ'],
  ['じ','ぢ'],
  ['ず','づ'],
  ['が','ぎ'],
  ['で','ど'],
  // katakana: these pairs catch almost everybody
  ['ソ','ン','ノ'],
  ['シ','ツ'],
  ['ク','タ','ケ'],
  ['ラ','ワ','ウ'],
  ['ア','マ','ヤ'],
  ['ス','ヌ','ナ'],
  ['メ','ヌ','ナ'],
  ['チ','テ'],
  ['ニ','ミ','ヨ'],
  ['ル','レ','ハ'],
  ['ホ','オ'],
  ['コ','ユ','ヨ','ロ'],
  ['ム','マ','ア']
];
