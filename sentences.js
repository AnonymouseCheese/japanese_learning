// Sentences for reading practice, written in kana only.
//
// These are written for this app rather than taken from anywhere, so they stick
// to the characters it teaches: the 46 hiragana, the 25 dakuten and the 46
// katakana. No small っ ゃ ゅ ょ and no long ー, which is why there is no
// がっこう and no でんしゃ here either.
//
// `parts` is the sentence split into its words. Joined together it is what you
// read - real Japanese has no spaces between words, and working out where one
// word ends is half the skill. The split is only shown once you have answered.
//
// `note` explains the particle at work. The particles are the point: は を に が
// の も と で へ do not mean anything by themselves, they mark what job each word
// is doing in the sentence.

var PARTICLES = ['は', 'を', 'に', 'が', 'の', 'も', 'と', 'で', 'へ', 'か', 'から', 'まで'];

var SENTENCES = [
  // --- は, the topic marker ---
  { parts: ['わたし', 'は', 'がくせい', 'です'],
    romaji: 'watashi wa gakusei desu',
    meaning: 'I am a student.',
    note: 'は marks the topic — what the sentence is about. Careful: as a particle it is said "wa", not "ha".' },

  { parts: ['これ', 'は', 'ほん', 'です'],
    romaji: 'kore wa hon desu',
    meaning: 'This is a book.',
    note: 'これ is "this". です is roughly "is".' },

  { parts: ['あれ', 'は', 'なん', 'です', 'か'],
    romaji: 'are wa nan desu ka',
    meaning: 'What is that?',
    note: 'か on the end turns a statement into a question. No question mark needed.' },

  { parts: ['ねこ', 'は', 'かわいい', 'です'],
    romaji: 'neko wa kawaii desu',
    meaning: 'Cats are cute.' },

  { parts: ['そら', 'は', 'あおい', 'です'],
    romaji: 'sora wa aoi desu',
    meaning: 'The sky is blue.' },

  { parts: ['この', 'ほん', 'は', 'おもしろい', 'です'],
    romaji: 'kono hon wa omoshiroi desu',
    meaning: 'This book is interesting.',
    note: 'この goes in front of a noun: この ほん = "this book".' },

  { parts: ['あの', 'ひと', 'は', 'だれ', 'です', 'か'],
    romaji: 'ano hito wa dare desu ka',
    meaning: 'Who is that person?' },

  { parts: ['ちち', 'は', 'せんせい', 'です'],
    romaji: 'chichi wa sensei desu',
    meaning: 'My father is a teacher.' },

  { parts: ['むすめ', 'は', 'がくせい', 'です'],
    romaji: 'musume wa gakusei desu',
    meaning: 'My daughter is a student.' },

  { parts: ['にほん', 'の', 'たべもの', 'は', 'おいしい', 'です'],
    romaji: 'nihon no tabemono wa oishii desu',
    meaning: 'Japanese food is delicious.' },

  // --- を, marking what the action is done to ---
  { parts: ['みず', 'を', 'のみます'],
    romaji: 'mizu wo nomimasu',
    meaning: 'I drink water.',
    note: 'を marks what the action is done to. It is only ever a particle — it never appears inside a word — and it is said "o".' },

  { parts: ['ごはん', 'を', 'たべます'],
    romaji: 'gohan wo tabemasu',
    meaning: 'I eat a meal.' },

  { parts: ['ほん', 'を', 'よみます'],
    romaji: 'hon wo yomimasu',
    meaning: 'I read a book.' },

  { parts: ['てがみ', 'を', 'かきます'],
    romaji: 'tegami wo kakimasu',
    meaning: 'I write a letter.' },

  { parts: ['おんがく', 'を', 'ききます'],
    romaji: 'ongaku wo kikimasu',
    meaning: 'I listen to music.' },

  { parts: ['えいが', 'を', 'みます'],
    romaji: 'eiga wo mimasu',
    meaning: 'I watch a film.' },

  { parts: ['みず', 'を', 'ください'],
    romaji: 'mizu wo kudasai',
    meaning: 'Water, please.',
    note: 'ください is "please give me". Useful in a shop.' },

  { parts: ['ねこ', 'が', 'みず', 'を', 'のみます'],
    romaji: 'neko ga mizu wo nomimasu',
    meaning: 'The cat drinks water.',
    note: 'Both at once: が marks who does it, を marks what it is done to.' },

  { parts: ['とり', 'が', 'そら', 'を', 'とびます'],
    romaji: 'tori ga sora wo tobimasu',
    meaning: 'A bird flies through the sky.',
    note: 'を can also mark the space something moves through, not only a thing acted on.' },

  // --- が, marking the one doing it or the one being described ---
  { parts: ['ねこ', 'が', 'います'],
    romaji: 'neko ga imasu',
    meaning: 'There is a cat.',
    note: 'います is for living things. あります is for everything else.' },

  { parts: ['みず', 'が', 'つめたい', 'です'],
    romaji: 'mizu ga tsumetai desu',
    meaning: 'The water is cold.' },

  { parts: ['あたま', 'が', 'いたい', 'です'],
    romaji: 'atama ga itai desu',
    meaning: 'I have a headache.',
    note: 'Literally "the head hurts". Japanese often leaves out who it belongs to.' },

  { parts: ['にほんご', 'が', 'すき', 'です'],
    romaji: 'nihongo ga suki desu',
    meaning: 'I like Japanese.',
    note: 'すき is "liked", so the thing you like takes が, not を.' },

  { parts: ['やま', 'が', 'たかい', 'です'],
    romaji: 'yama ga takai desu',
    meaning: 'The mountain is tall.' },

  { parts: ['だれ', 'が', 'きます', 'か'],
    romaji: 'dare ga kimasu ka',
    meaning: 'Who is coming?' },

  { parts: ['ねこ', 'と', 'いぬ', 'が', 'います'],
    romaji: 'neko to inu ga imasu',
    meaning: 'There are a cat and a dog.',
    note: 'と joins two nouns: "A and B".' },

  // --- に, marking where to, when, or where something is ---
  { parts: ['うみ', 'に', 'いきます'],
    romaji: 'umi ni ikimasu',
    meaning: 'I go to the sea.',
    note: 'に marks where you are heading.' },

  { parts: ['いえ', 'に', 'かえります'],
    romaji: 'ie ni kaerimasu',
    meaning: 'I go home.' },

  { parts: ['ろくじ', 'に', 'おきます'],
    romaji: 'rokuji ni okimasu',
    meaning: 'I get up at six.',
    note: 'The same に marks a time as well as a destination.' },

  { parts: ['ここ', 'に', 'あります'],
    romaji: 'koko ni arimasu',
    meaning: 'It is here.' },

  { parts: ['にわ', 'に', 'とり', 'が', 'います'],
    romaji: 'niwa ni tori ga imasu',
    meaning: 'There is a bird in the garden.',
    note: 'に marks where something is; が marks the thing that is there.' },

  { parts: ['あした', 'ともだち', 'に', 'あいます'],
    romaji: 'ashita tomodachi ni aimasu',
    meaning: 'I am meeting a friend tomorrow.' },

  { parts: ['だいがく', 'へ', 'いきます'],
    romaji: 'daigaku e ikimasu',
    meaning: 'I go to the university.',
    note: 'へ also marks direction, and as a particle it is said "e", not "he".' },

  // --- の, joining two nouns ---
  { parts: ['わたし', 'の', 'ほん', 'です'],
    romaji: 'watashi no hon desu',
    meaning: 'It is my book.',
    note: 'の links two nouns, usually as "of" or an apostrophe-s: わたし の ほん = "my book".' },

  { parts: ['ともだち', 'の', 'くるま', 'です'],
    romaji: 'tomodachi no kuruma desu',
    meaning: "It is my friend's car." },

  { parts: ['その', 'かばん', 'は', 'わたし', 'の', 'です'],
    romaji: 'sono kaban wa watashi no desu',
    meaning: 'That bag is mine.',
    note: 'の can stand on its own at the end, meaning "mine".' },

  { parts: ['わたし', 'の', 'なまえ', 'は', 'けん', 'です'],
    romaji: 'watashi no namae wa ken desu',
    meaning: 'My name is Ken.' },

  // --- も, "also" ---
  { parts: ['わたし', 'も', 'いきます'],
    romaji: 'watashi mo ikimasu',
    meaning: 'I am going too.',
    note: 'も replaces は or が and adds "too" or "also".' },

  { parts: ['これ', 'も', 'ください'],
    romaji: 'kore mo kudasai',
    meaning: 'This one too, please.' },

  { parts: ['ねこ', 'も', 'いぬ', 'も', 'すき', 'です'],
    romaji: 'neko mo inu mo suki desu',
    meaning: 'I like both cats and dogs.',
    note: 'も twice means "both ... and ...".' },

  // --- で, where an action happens or how ---
  { parts: ['ここ', 'で', 'たべます'],
    romaji: 'koko de tabemasu',
    meaning: 'I eat here.',
    note: 'で marks where an action happens. に marks where something simply is.' },

  { parts: ['くるま', 'で', 'いきます'],
    romaji: 'kuruma de ikimasu',
    meaning: 'I go by car.',
    note: 'The same で marks the means — by car, by hand, in Japanese.' },

  { parts: ['えき', 'で', 'あいます'],
    romaji: 'eki de aimasu',
    meaning: 'I will meet you at the station.' },

  { parts: ['はは', 'は', 'はなや', 'で', 'はたらきます'],
    romaji: 'haha wa hanaya de hatarakimasu',
    meaning: 'My mother works at a florist.' },

  { parts: ['にほんご', 'で', 'はなします'],
    romaji: 'nihongo de hanashimasu',
    meaning: 'I speak in Japanese.' },

  // --- から and まで, from and until ---
  { parts: ['いえ', 'から', 'だいがく', 'まで', 'あるきます'],
    romaji: 'ie kara daigaku made arukimasu',
    meaning: 'I walk from home to the university.',
    note: 'から is "from", まで is "as far as" or "until".' },

  { parts: ['あさ', 'から', 'よる', 'まで', 'はたらきます'],
    romaji: 'asa kara yoru made hatarakimasu',
    meaning: 'I work from morning until night.' },

  // --- questions ---
  { parts: ['なまえ', 'は', 'なん', 'です', 'か'],
    romaji: 'namae wa nan desu ka',
    meaning: 'What is your name?' },

  { parts: ['どこ', 'に', 'いきます', 'か'],
    romaji: 'doko ni ikimasu ka',
    meaning: 'Where are you going?' },

  { parts: ['いつ', 'きます', 'か'],
    romaji: 'itsu kimasu ka',
    meaning: 'When are you coming?' },

  { parts: ['これ', 'は', 'いくら', 'です', 'か'],
    romaji: 'kore wa ikura desu ka',
    meaning: 'How much is this?' },

  { parts: ['いま', 'なんじ', 'です', 'か'],
    romaji: 'ima nanji desu ka',
    meaning: 'What time is it now?' },

  { parts: ['げんき', 'です', 'か'],
    romaji: 'genki desu ka',
    meaning: 'How are you?',
    note: 'Literally "are you well?".' },

  { parts: ['トイレ', 'は', 'どこ', 'です', 'か'],
    romaji: 'toire wa doko desu ka',
    meaning: 'Where is the toilet?',
    note: 'トイレ is katakana, because it came from English.' },

  // --- everyday lines ---
  { parts: ['はい', 'げんき', 'です'],
    romaji: 'hai genki desu',
    meaning: 'Yes, I am well.' },

  { parts: ['おはよう', 'ございます'],
    romaji: 'ohayou gozaimasu',
    meaning: 'Good morning.',
    note: 'ございます makes it polite. Without it, おはよう is what you say to friends.' },

  { parts: ['ありがとう', 'ございます'],
    romaji: 'arigatou gozaimasu',
    meaning: 'Thank you.' },

  { parts: ['また', 'あした'],
    romaji: 'mata ashita',
    meaning: 'See you tomorrow.' },

  { parts: ['きのう', 'うみ', 'に', 'いきました'],
    romaji: 'kinou umi ni ikimashita',
    meaning: 'I went to the sea yesterday.',
    note: 'いきます becomes いきました for the past. ます → ました.' },

  { parts: ['まいあさ', 'ごはん', 'を', 'たべます'],
    romaji: 'maiasa gohan wo tabemasu',
    meaning: 'I eat a meal every morning.' },

  { parts: ['よる', 'ほん', 'を', 'よみます'],
    romaji: 'yoru hon wo yomimasu',
    meaning: 'I read a book at night.' },

  { parts: ['あめ', 'が', 'ふります'],
    romaji: 'ame ga furimasu',
    meaning: 'It rains.',
    note: 'ふります is what rain and snow do.' },

  { parts: ['あつい', 'です', 'ね'],
    romaji: 'atsui desu ne',
    meaning: "It's hot, isn't it?",
    note: 'ね on the end asks for agreement, the way "right?" does in English.' },

  { parts: ['たかい', 'です', 'ね'],
    romaji: 'takai desu ne',
    meaning: "That's expensive, isn't it?" },

  { parts: ['わたし', 'は', 'にほんご', 'を', 'ならいます'],
    romaji: 'watashi wa nihongo wo naraimasu',
    meaning: 'I am learning Japanese.',
    note: 'は marks you as the topic, を marks what is being learned. Both in one short sentence.' }
];

// What each word means on its own, so a sentence can be read piece by piece.
// Particles get a job description in brackets rather than a translation, because
// they do not translate - they mark what the word before them is doing.
var GLOSS = {
  // particles and endings
  'は': '(topic)',
  'が': '(subject)',
  'を': '(object)',
  'に': 'to / at',
  'へ': 'to (direction)',
  'の': "'s / of",
  'も': 'too',
  'と': 'and / with',
  'で': 'at / by',
  'から': 'from',
  'まで': 'until',
  'か': '(question)',
  'ね': 'right?',
  'です': 'is / am',
  'ございます': '(polite)',

  // people
  'わたし': 'I',
  'ひと': 'person',
  'だれ': 'who',
  'ちち': 'my father',
  'はは': 'my mother',
  'むすめ': 'my daughter',
  'ともだち': 'friend',
  'せんせい': 'teacher',
  'がくせい': 'student',
  'けん': 'Ken',
  'なまえ': 'name',

  // pointing at things
  'これ': 'this one',
  'あれ': 'that one',
  'この': 'this',
  'その': 'that',
  'あの': 'that (over there)',
  'ここ': 'here',
  'どこ': 'where',
  'なん': 'what',
  'なんじ': 'what time',
  'いつ': 'when',
  'いくら': 'how much',

  // things
  'ほん': 'book',
  'みず': 'water',
  'ごはん': 'a meal',
  'てがみ': 'letter',
  'おんがく': 'music',
  'えいが': 'film',
  'たべもの': 'food',
  'くるま': 'car',
  'かばん': 'bag',
  'トイレ': 'toilet',
  'あめ': 'rain',
  'そら': 'sky',
  'やま': 'mountain',
  'うみ': 'sea',
  'にわ': 'garden',
  'いえ': 'home',
  'えき': 'station',
  'だいがく': 'university',
  'はなや': 'florist',
  'にほん': 'Japan',
  'にほんご': 'Japanese',
  'ねこ': 'cat',
  'いぬ': 'dog',
  'とり': 'bird',
  'あたま': 'head',

  // when
  'いま': 'now',
  'あさ': 'morning',
  'よる': 'night',
  'あした': 'tomorrow',
  'きのう': 'yesterday',
  'まいあさ': 'every morning',
  'ろくじ': 'six o\u2019clock',
  'また': 'again',

  // describing
  'かわいい': 'cute',
  'あおい': 'blue',
  'おもしろい': 'interesting',
  'おいしい': 'delicious',
  'つめたい': 'cold',
  'あつい': 'hot',
  'たかい': 'tall / expensive',
  'いたい': 'hurts',
  'すき': 'liked',
  'げんき': 'well',
  'はい': 'yes',
  'おはよう': 'good morning',
  'ありがとう': 'thank you',

  // doing
  'のみます': 'drink',
  'たべます': 'eat',
  'よみます': 'read',
  'かきます': 'write',
  'ききます': 'listen',
  'みます': 'watch',
  'います': 'is (alive)',
  'あります': 'is (thing)',
  'いきます': 'go',
  'いきました': 'went',
  'きます': 'come',
  'かえります': 'go home',
  'おきます': 'get up',
  'あいます': 'meet',
  'あるきます': 'walk',
  'はたらきます': 'work',
  'はなします': 'speak',
  'ならいます': 'learn',
  'とびます': 'fly',
  'ふります': 'falls',
  'ください': 'please give me'
};
