// The gojuon chart. Columns are the vowels a i u e o, and each row is one
// consonant line. null marks a slot that does not exist - there is no "yi",
// so that cell is simply blank on the chart.
var VOWELS = ['a', 'i', 'u', 'e', 'o'];

var CHART = [
  { id: 'a',  label: 'あ', cells: [['あ','a'],   ['い','i'],   ['う','u'],   ['え','e'],   ['お','o']] },
  { id: 'k',  label: 'か', cells: [['か','ka'],  ['き','ki'],  ['く','ku'],  ['け','ke'],  ['こ','ko']] },
  { id: 's',  label: 'さ', cells: [['さ','sa'],  ['し','shi'], ['す','su'],  ['せ','se'],  ['そ','so']] },
  { id: 't',  label: 'た', cells: [['た','ta'],  ['ち','chi'], ['つ','tsu'], ['て','te'],  ['と','to']] },
  { id: 'n',  label: 'な', cells: [['な','na'],  ['に','ni'],  ['ぬ','nu'],  ['ね','ne'],  ['の','no']] },
  { id: 'h',  label: 'は', cells: [['は','ha'],  ['ひ','hi'],  ['ふ','fu'],  ['へ','he'],  ['ほ','ho']] },
  { id: 'm',  label: 'ま', cells: [['ま','ma'],  ['み','mi'],  ['む','mu'],  ['め','me'],  ['も','mo']] },
  { id: 'y',  label: 'や', cells: [['や','ya'],  null,         ['ゆ','yu'],  null,         ['よ','yo']] },
  { id: 'r',  label: 'ら', cells: [['ら','ra'],  ['り','ri'],  ['る','ru'],  ['れ','re'],  ['ろ','ro']] },
  { id: 'w',  label: 'わ', cells: [['わ','wa'],  null,         null,         null,         ['を','wo']] },
  { id: 'nn', label: 'ん', cells: [['ん','n'],   null,         null,         null,         null] }
];

// Flat list of all 46: { kana, romaji, row }
var KANA = [];
CHART.forEach(function (row) {
  row.cells.forEach(function (cell) {
    if (cell) KANA.push({ kana: cell[0], romaji: cell[1], row: row.id });
  });
});

// Characters that look alike - used to make the wrong answers actually tricky.
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
  ['ん','そ','れ']
];
