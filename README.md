# Hiragana Practice

A small web app for drilling the 46 basic hiragana on a phone. No install, no
libraries, no build step — just three files that a browser opens directly.

## How it is laid out

The app opens on a **set chooser**:

- **Hiragana** — the 46 basic characters.
- **Dakuten** — the same hiragana carrying a small mark that changes the sound.
  か `ka` becomes が `ga`, は `ha` becomes ば `ba` or ぱ `pa`. 25 characters in
  five rows: g, z, d, b, p.
- **Katakana** — the same 46 sounds as hiragana in different shapes, used for
  words borrowed from other languages, foreign names and sound effects.
- **Combination** — several sets mixed together.
- **Sentences** — whole sentences, and the particles that hold them together.

Each one opens the same menu of six practice modes — **Identify**, **Train**,
**Write**, **List**, **Copy** and **Words** — plus an **Exam**.

## Combination

Combination has no characters of its own. Ticking Hiragana, Dakuten or Katakana
glues those charts together into one set, and all three modes then run across
the lot. Untick down to two if you only want to mix hiragana and katakana. One
set always stays ticked.

The character picker keeps the sets apart rather than running their rows
together: one labelled block per ticked set, each with its own column buttons.
So a column toggle in the hiragana block switches off あ か さ た な は ま や ら わ ん
and leaves katakana alone. The reference chart is grouped the same way.

## Sentences

Words tell you what things are called. Sentences are where Japanese starts, and
the difference is the **particles** — は を に が の も と で へ. They carry no
meaning on their own; they mark what job each word is doing. English does that
with word order, Japanese does it with these.

A sentence appears with no spaces between the words, because real Japanese has
none and working out where one word ends is half the skill. Reveal it and the
same characters reappear split into words, **each with its own meaning printed
underneath**, particles picked out in colour, plus the reading, the whole
translation, and a note on the particle at work.

That word-by-word line is what makes the order readable. Japanese puts the verb
last, and the particles — not the order — say who did what, so a sentence rarely
maps onto English one word at a time:

```
ねこ    が          みず     を          のみます
cat   (subject)   water   (object)    drinks
```

は が を か are labelled rather than translated, because they mark a role and
have no English equivalent. に と で から do translate, and are.

65 sentences covering all twelve of は を に が の も と で へ か から まで.

This is also the only place **を** can be taught. It is purely a particle — it
never appears inside a word — so no word list could ever have shown it to you in
use.

The sentences are written for this app rather than taken from anywhere, which
means they stick to exactly the characters it teaches: no small っ ゃ ゅ ょ and no
long ー. That is why there is no がっこう and no でんしゃ here either.

## Words

A word appears in kana. You read it, tap **Show answer**, and the reading and the
English meaning appear. Then you mark yourself right or wrong, the same as in
Write mode.

Which words you get depends on the set you are in:

| Set | Words | Rule |
| --- | --- | --- |
| Hiragana | 316 | Spelled with nothing but the 46 basic hiragana |
| Dakuten | 127 | Contains at least one ゛ or ゜ character |
| Katakana | 101 | Spelled with nothing but the 46 katakana |
| Combination | up to 544 | Anything spelled inside the ticked sets |

The **romaji** chip in the corner decides whether the reading is shown up front
or only after you answer. Off is the real practice; on is useful when you are
still slow.

The word is read aloud when the answer appears, and a **♪ listen** button sits
with the answer to replay it in one tap. There is no on/off switch: a toggle
meant that if it was already on, the first tap turned it off and you needed a
second to hear anything.

## Sound

One control sets the volume for everything: **Sound** on the opening screen,
with **Off · Low · Medium · Full**. Picking a level plays a sample so you can
hear what you chose. Every sound in the app is spoken through a single function,
so there is exactly one place that decides how loud anything is — nothing can
drift louder or quieter than anything else.

**Off** silences the whole app: the listen button disappears, chart taps go
quiet, and revealing a word says nothing.

Audio uses the browser's own speech synthesis, so there are no files to host and
nothing to license, and it works offline. iOS ships Japanese voices, so a phone
reads kana properly. Where a browser has no speech support the controls simply
do not appear.

Browser speech needs a little coaxing to start cleanly. Two things are done for
it: a silent utterance is queued ahead of every spoken one, because the audio
session takes a moment to open and swallows whatever is playing while it does;
and the session is opened on your first touch anywhere in the app, because the
very first speak of a page's life is often dropped outright — which is what makes
a listen button seem to need two taps.

It is deliberately limited to three places:

- **Words**, when the answer is revealed — never before, or it would be the
  answer.
- **The chart**, where tapping any character says it. Reachable from the menu as
  well as mid-drill.
- **Copy**, where tapping the big character says it. Nothing there is being
  tested, so the sound gives nothing away — the same reasoning as the chart.

Not in Identify, Train, Write or List. In Identify and Train the sound *is* the answer. In Write
and List it would be tempting, but single isolated kana are where synthesised
speech is least reliable — を alone is read as "wo" rather than "o", ん barely
registers, and ぢ and づ come out identical to じ and ず. Whole words give the
synthesiser enough context to get it right.

A word is only ever offered when every one of its characters is taught by the
set you are in, so you never meet a character the app has not shown you. That
rules out anything needing the small っ or ゃ ゅ ょ — no がっこう, no でんしゃ. For
katakana it also rules out the long mark ー and the katakana dakuten (ガ ザ ダ バ
パ), which unfortunately excludes コーヒー, テレビ and パン. Those come back when
those characters get sets of their own.

None of this is tagged by hand — a word's set is worked out from its characters,
so the lists cannot drift out of step.

Four characters never appear in any word, and cannot. **を** is the object
particle: it only ever appears between words, never inside one. **ヲ** is its
katakana twin and is effectively unused in modern Japanese. **ヌ** and **ヨ**
appear in plenty of loanwords, but every common one also needs the long mark ー
or a katakana dakuten, neither of which the app teaches yet.

Picking one opens the **main menu** with the practice modes. Drill for as
long as you like, tap **‹** to come back, and **‹** again to switch sets. Below
the modes is the character picker for whichever set you are in.

Each set keeps its own selection and its own score history, because no character
appears in two sets. Turning off the `p` row while practising dakuten does not
disturb your hiragana selection.

### Where the spelling is not the sound

A few characters are written one way and pronounced another. Those show both, as
**written (sounds like)**:

| Character | Shown as | Why |
| --- | --- | --- |
| を | `wo (o)` | Written `wo`, but said `o`. It is the object particle. |
| ぢ | `di (ji)` | Sounds the same as じ. Spelled `di` here so each prompt has one answer. |
| づ | `du (zu)` | Sounds the same as ず, same reason. |
| ヲ | `wo (o)` | The katakana equivalent, rare in modern writing. |

Every other character just shows its romaji.

## The modes

- **Identify (か → ka)** — a character appears, you tap the sound it makes. The three
  wrong answers are picked from look-alike characters and the same row, so it
  stays hard rather than guessable.
- **Train** — a line of eight characters, read left to right, typing or
  drawing the sound of each one. See below.
- **Write (ka → か)** — a sound appears, you draw the character with your finger,
  then tap **Show answer**. The real character appears behind your drawing as a
  hollow outline, so it stays clearly visible without hiding your own strokes,
  and you mark yourself right or wrong. Which character comes next is weighted
  toward what you are weakest on.
- **List** — the same drawing pad, but walking straight down the chart in order:
  あ, い, う, え, お, か, and so on. A counter shows where you are (`7 of 46`) and
  a **‹ back** chip steps to the previous character. When you reach the end it
  says so and offers to start again.

  This is the one to use for building sequence memory — knowing that く comes
  after き is a different skill from recognising く on its own. It follows your
  selection, so with only the か row switched on it walks か き く け こ and
  finishes.
- **Copy** — not a test at all; the way a first exercise book works. See below.

## Copy

There is one big box to write in, and a switch for what goes in it:

- **Whole row** (the default) — a row of the chart, written as a line. か, tap
  **Done**, き, **Done**, and so on to こ; then the line again.
- **One at a time** — a single character, six times over. Better for a
  character that is brand new.

Either way it is six goes:

```
go 1  2  3     printed faintly in the box, fainter each time - trace over it
go 4  5  6     the box is empty - write it on your own
```

The character you are on is shown at the top with its sound — tap it to hear
it. Above the big box is a strip of small boxes keeping what you have written:
for a row, the five characters of the line you are on (each always shown
faintly, so you can see what the line is even when you are on your own); for
one character, its six goes. Tap a small box to go back and redo it.

At the end everything is laid out together like a finished exercise-book page
— for a row, five across and six lines down. **Again** does it over, **Next
row** moves on. **Clear** wipes whatever is in the big box. Nothing is marked,
scored or saved.

Every box has the dashed cross through the middle that a Japanese exercise book
has, so you can see where each stroke sits — the model at the top too, so what
you see there maps straight onto what you write.

It walks the chart in order and follows the character picker. Rows come from
the chart, so や ゆ よ is a line of three and わ を a line of two; ん on its own
works like one at a time. If you switch on six characters or fewer in the
picker — ぬ め ね れ わ, say — they make a single line wherever they sit on the
chart. **‹ prev** and **next ›** in the top bar skip to another row or
character at any point, and after the last one it goes back round to the first.
Switching between the two keeps your place, and the app remembers which you
used.

The first version had six small boxes on screen at once. They were too small to
write in comfortably, which is why it is now one big box used over and over.

### Safari going back a page

Safari treats a swipe that starts near the left edge of the screen as "go back
a page", which leaves the app. A stroke started at the left of a writing box
did exactly that. So the writing areas in Copy, Write and List all sit 32 pixels
in from the screen edges. As a second line of defence a touch on them is
cancelled, which should also stop Safari reading it as a swipe — the drawing
runs on pointer events and does not need the touch, so nothing is lost. The
margin is the part that is certain; the cancelling could only be tested in
Chrome, not on an iPhone.

Opened from the home screen the app starts fresh, with no earlier page behind
it, so there is nothing for a stray swipe to go back to.

### The handwriting font

Copy shows the characters in **Klee One**, a "textbook" font, rather than the
font used everywhere else in the app. The usual screen font is drawn for
reading, and some characters come out differently from how a hand writes them:
the bottom of き and of さ joins up into one line, where by hand it is two
separate strokes. Klee is drawn the way a pen makes them, which is what you
want to be copying.

It is only the kana — the full font is 9 MB, the file in `fonts/` is 25 KB —
and the browser only downloads it the first time Copy is opened. Klee One is
free to use and share under the SIL Open Font License; the licence is in
`fonts/OFL.txt`.

On a desktop: `space` for Done, `→` and `←` to skip between rows or characters, `c` to
clear.

## Train

A line of eight characters — the train — to read from left to right, the way
you would read a line of real text. You **type** the sound of each one rather
than picking it from buttons. With four buttons you only have to recognise the
answer when you see it; typing makes you come up with it yourself.

```
 ね   か   し   と   み   う   せ   ろ
 ne   ka   shi  t                          <- you are typing "to"
```

- Type the sound and press **space**. The character you are on is outlined,
  and the next one lights up. You can type straight through — `ne ka shi to `
  answers four in a row, however fast it goes in.
- Each answer is checked when you press space, not letter by letter. Checking
  as you type would give it away: a `k` that is not marked wrong tells you the
  character is in the k row.
- Right answers turn green, wrong ones red, and either way the correct sound
  appears under the character.
- **Don't know one?** Press return (labelled **next** on a phone keyboard) with
  nothing typed, and it shows you the answer and moves on. It counts as a miss.
- At the end of the line you get the score, how many seconds it took, and the
  ones you missed with what you typed for each. Return, or **Next train**,
  brings another line.

A few sounds have a second common spelling, and both are accepted: `shi`/`si`,
`chi`/`ti`, `tsu`/`tu`, `fu`/`hu`, `ji`/`zi`, `n`/`nn`, and the characters
already shown two ways — を `wo` or `o`, ぢ `di` or `ji`, づ `du` or `zu`.
Capitals do not matter.

Characters are chosen the same way as Identify: weighted toward what you are
weak on, never the same one within three of itself, and following the
character picker. Every answer feeds your progress, so a miss here brings the
character up more often everywhere else.

The **chart** button opens the chart to look things up or memorise from, and
**back** returns you to the line exactly as you left it — the same characters,
your answers so far, anything half typed or drawn, and in Non-stop the train
where it was. The time spent looking is not counted, in the seconds at the
end of a line or against your pace. (Identify and Write are different: there
the chart drops the question on screen, so it cannot be used to look up the
answer.) The first version started a new line after the chart, which threw
away what you were in the middle of.

On a phone the keyboard covers the bottom half of the screen, so the line and
the typing box sit right at the top where they stay in view. Tap the line if
the keyboard has gone away and it comes back.

### Line of 8, or Non-stop

The second switch, beside Type / Draw. **Line of 8** is everything above: eight
characters, then a result. **Non-stop** is a train that keeps coming:

- The carriages slide from right to left, and new ones keep arriving on the
  right. Answer the outlined one — the first you have not answered yet.
- **The platform.** In the middle of the track is a highlighted platform, two
  carriages wide. The one you are on rolls onto it, and the train stops at the
  far end and waits there until you answer. Nothing ever runs out of time and
  turns red by itself — only a wrong answer, or giving up on one, is a miss.
  So the track reads left to right: what you have answered, the one you are
  on, and what is coming.
- The first version had no platform: the train ran on to the left edge, and
  anything still unanswered there was marked a miss.
- **You never wait for it.** Answer one and, if the next has not reached the
  platform yet, the train hurries to bring it there in a fraction of a second,
  then rolls along the platform at its normal speed. So every answer shunts
  the train along, as fast as you go.
- **It matches your pace.** There is no speed setting. Each right answer is
  timed, and the speed moves 40% of the way toward the pace you answered at —
  answer at 60 a minute and within a few answers the train is close to 60;
  slow down on a hard one and it eases off. Each miss slows it by 15%. The
  speed is how fast it rolls along the platform; a slower one gives you
  longer to read before it stops.
- The speed shows at the top — `Train · 20/min` is twenty characters a
  minute — and it is remembered, separately for typing and drawing, so next
  time you start where you left off. Typing starts at 20 a minute, drawing at 6.
- The first version only sped up 5% per right answer and made you wait for
  each new carriage to crawl in at the train's speed, so a quick reader spent
  most of the time waiting.
- Every answer counts toward your progress as you go. There is no end; tap
  **‹** when you are done, and the train stops.
- In Draw it always checks one by one, since there is no end of the line to
  check at, and the train waits while you tap Got it or Missed it — marking
  yourself never costs you time.
- Putting the phone down or switching apps pauses it rather than letting it
  run on.

### Type or Draw

A switch under the line chooses how you answer. **Type** is everything above.
**Draw** gives you a box to write the sound in by hand instead — `ka` written
with your finger — and the app remembers which you used.

A phone browser has no way to read handwriting, so in Draw you check yourself,
the same as Write. A second switch, shown only in Draw, says when: **Check one
by one** or **Check all at the end**. That choice is remembered too.

**One by one:**

- Write the sound of the outlined character and tap **Check**. The right
  answer appears in large letters just above the box — `ふ = fu` — in place
  of the instructions. Then tap **Got it** or **Missed it**, and the next
  character comes up with the box empty.
- The answer used to appear inside the box, behind your writing, but you
  write in exactly that spot and your own strokes covered it. Above the box
  nothing can, and since it replaces a line rather than adding one, the box
  stays where it is while you compare.
- Each one counts toward your progress as soon as you mark it, the same as a
  typed answer, and its carriage turns green or red with the answer under it.
- Check with nothing written is a miss straight away — there is nothing to
  compare.
- At the end of the line you get the score, the time and the ones you missed,
  the same as Type.

On a desktop: `space` to check, then `y` or `n`.

**All at the end:**

- Write the sound of the outlined character and tap **Next**. The ones you
  have done fade, and no answers show yet. **clear** wipes the box. Stuck?
  Tap Next with nothing written.
- After the eighth it says **Check**. Each drawing then comes back beside the
  right answer, all ticked. Tap any you got wrong to cross it, and tap again
  if you change your mind. A blank one is always a miss.
- **Next train** counts them toward your progress and brings a new line.
  Going back to the menu counts them too — nothing you checked is lost.

On a desktop: `space` for Next.

Either way, the box is wider than it is tall, since a sound is a short word,
with a dashed line to write along, and `c` clears it on a desktop. Like every
writing area in the app it sits 32 pixels in from the screen edges, so a
stroke at the left cannot trigger Safari's swipe back.

## Exam

Practice is deliberately unfair: it repeats what you are weak on, skips what you
know, gives instant feedback and never ends. That makes the running score
meaningless. An exam is the opposite.

Three parts, run back to back:

| Part | Questions | Scored |
| --- | --- | --- |
| Identify | 10 | By the app |
| Write | 10 | By you |
| Reading | 5 | By you |

Nothing is marked right or wrong while you are in it. The chart button, the
romaji chip and the list controls are all hidden, since each would hand you an
answer. The counter in the corner shows the question number rather than a score.

At the end you get the total, a breakdown by part, and a list of exactly what
you missed and where. Identify is the trustworthy number, because it is the only
part the app can mark itself.

### How everything eventually gets tested

An exam samples 25 questions rather than running all 46 characters, but it
prefers what the current round has not covered yet. Each exam takes twenty
characters it has not asked before, so three exams sweep the whole set and then
the round starts again. The menu shows where you are — *20 of 46 characters
examined so far*.

Exam answers feed the same progress the practice modes use, so missing something
in an exam pushes it forward in practice afterwards.

## What it remembers

Progress is saved in the browser itself (localStorage), so it survives closing
Safari, and the menu lists the characters you miss most often.

What comes up next is weighted by two things:

- **How little you have tested it.** Anything drilled fewer than four times is
  pushed forward, hard. Switch a new row on and it dominates until it has been
  seen a few times.
- **How often you get it wrong.** Each miss adds substantially to a character's
  weight; getting it right again reduces it.

Nothing repeats within three questions, so a character cannot come straight back
while it is still fresh in your mind.

Measured through the app: with one row settled and the rest switched on, the
settled row took 1.7% of draws where an even split would be 10.9%. A character
missed repeatedly took 24% of draws where an even split would be 2.2%.

## The chart, mid-drill

Identify and Write both carry a **chart** button in the top bar. It pauses the
session and shows every character in the set with its romaji, switched-off ones
drawn with a dashed outline — somewhere to re-ground yourself part way through
without losing your place.

Opening it **abandons the current question rather than scoring it**, so it can
never be used to look up the answer that is on screen. You come back to a fresh
question and your running score is untouched.

## Choosing what to practise

The **Characters** screen is the gojūon chart as you would see it in a textbook:
the vowels `a i u e o` across the top, one row per consonant line down the side,
with the gaps left blank where a character does not exist (there is no "yi").

Tap any character to switch it on or off. Down the left is a button per row
(`k`, `s`, `t` …, with `–` for the vowel row that has no consonant) and across
the top one per vowel column — tap either to switch that whole line. Switched-off
characters are drawn with a dashed outline rather than faded out, so you can
still read them. A small dot on each shows its state: filled means the line is
entirely on, an outline means part of it is, and faded means none of it is.

Tapping a line that is only half on fills it up rather than emptying it, which
is usually what you want part-way through choosing. **All** and **None** are in
the top corner.

### Easy, Medium, Hard

On the same screen is a switch for where the *wrong* answers come from. It
applies to **Identify only** — Write has no wrong answers to choose between, so
the setting does nothing there.

| Level | Wrong answers come from |
| --- | --- |
| **Easy** (default) | The same row as the character shown. A question about く is answered against か き け こ. |
| **Medium** | Anywhere you have switched on. Three rows on means all three rows are in play. |
| **Hard** | Any character in the set, including rows you have switched off. |

Easy is the one to use while a row is still new — it keeps the question inside
the five characters you are working on. Medium is the real test of a selection.
Hard is for when the whole set is close to solid.

On Medium and Hard, look-alike characters are preferred over random ones, so あ
tends to be offered against お and む rather than something obvious.

If your selection is smaller than four characters, Identify simply shows fewer
buttons rather than padding the question out with characters you turned off.

## On a desktop

The layout stays a centred phone-width column rather than stretching across the
monitor. You can drill with the keyboard instead of the mouse:

| Key | Does |
| --- | --- |
| `1` `2` `3` `4` | Pick that answer (Identify) |
| `space` | Show the answer (Write) |
| `y` / `n` | Mark yourself right / wrong |
| `c` | Clear the drawing |
| `esc` | Back to the main menu |

Drawing works with the mouse too — hold the button down and drag.

## Trying it on your computer first

Double-click `index.html`. That's it. Make the window narrow and tall to see
roughly what the phone gets.

## Where it lives

Live at **https://anonymousecheese.github.io/japanese_learning/**

Hosted free on GitHub Pages out of this repository. Pages is already switched on
and set to serve the `main` branch from the root folder, so there is nothing to
configure again.

## Making it look like a real app

In Safari, tap the share button (the square with the arrow), then **Add to Home
Screen**. It opens full screen with no address bar and remembers your progress.

## Updating it later

Change a file, then:

```
git add -A
git commit -m "describe what changed"
git push
```

The live site updates itself within a minute.

**If the phone still shows the old version:** GitHub Pages tells browsers to
cache `app.js` and `style.css` for ten minutes, so Safari will happily keep
running the old code. To get around that, the links in `index.html` carry a
version number:

```html
<link rel="stylesheet" href="style.css?v=3">
<script src="app.js?v=3"></script>
```

Bump every `v=3` to `v=4` whenever you change the CSS or JavaScript. The number
means nothing to the browser except "this is a different file", which forces a
fresh download. Then pull down to refresh on the phone.

## The files

| File | What it does |
| --- | --- |
| `index.html` | The page structure — the four screens and their buttons. |
| `style.css` | All the appearance. Follows your phone's light/dark setting. |
| `data.js` | The character sets, their charts, and the look-alike groups. |
| `words.js` | The word list for reading practice — kana, reading, meaning. |
| `sentences.js` | The sentences, split into words, with a note on each particle. |
| `app.js` | The logic — screens, choosing characters, scoring, the drawing pad. |
| `fonts/` | The handwriting font Copy uses, cut down to just the kana, and its licence. |
