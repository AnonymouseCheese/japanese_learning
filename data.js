// The 46 basic hiragana, grouped by row.
const ROWS = [
  { id: 'a',  label: 'あ  a i u e o',   items: [['あ','a'],['い','i'],['う','u'],['え','e'],['お','o']] },
  { id: 'k',  label: 'か  ka ki ku ke ko', items: [['か','ka'],['き','ki'],['く','ku'],['け','ke'],['こ','ko']] },
  { id: 's',  label: 'さ  sa shi su se so', items: [['さ','sa'],['し','shi'],['す','su'],['せ','se'],['そ','so']] },
  { id: 't',  label: 'た  ta chi tsu te to', items: [['た','ta'],['ち','chi'],['つ','tsu'],['て','te'],['と','to']] },
  { id: 'n',  label: 'な  na ni nu ne no', items: [['な','na'],['に','ni'],['ぬ','nu'],['ね','ne'],['の','no']] },
  { id: 'h',  label: 'は  ha hi fu he ho', items: [['は','ha'],['ひ','hi'],['ふ','fu'],['へ','he'],['ほ','ho']] },
  { id: 'm',  label: 'ま  ma mi mu me mo', items: [['ま','ma'],['み','mi'],['む','mu'],['め','me'],['も','mo']] },
  { id: 'y',  label: 'や  ya yu yo',     items: [['や','ya'],['ゆ','yu'],['よ','yo']] },
  { id: 'r',  label: 'ら  ra ri ru re ro', items: [['ら','ra'],['り','ri'],['る','ru'],['れ','re'],['ろ','ro']] },
  { id: 'w',  label: 'わ  wa wo',        items: [['わ','wa'],['を','wo']] },
  { id: 'nn', label: 'ん  n',            items: [['ん','n']] }
];

// Flat list: { kana, romaji, row }
const KANA = [];
ROWS.forEach(function (row) {
  row.items.forEach(function (pair) {
    KANA.push({ kana: pair[0], romaji: pair[1], row: row.id });
  });
});

// Characters that look alike — used to make the wrong answers actually tricky.
const LOOKALIKES = [
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
