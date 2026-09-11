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

Each one opens the same menu of four practice modes — **Identify**, **Write**,
**List** and **Words** — plus an **Exam**.

## Combination

Combination has no characters of its own. Ticking Hiragana, Dakuten or Katakana
glues those charts together into one set, and all three modes then run across
the lot. Untick down to two if you only want to mix hiragana and katakana. One
set always stays ticked.

The character picker keeps the sets apart rather than running their rows
together: one labelled block per ticked set, each with its own column buttons.
So a column toggle in the hiragana block switches off あ か さ た な は ま や ら わ ん
and leaves katakana alone. The reference chart is grouped the same way.

## Words

A word appears in kana. You read it, tap **Show answer**, and the reading and the
English meaning appear. Then you mark yourself right or wrong, the same as in
Write mode.

Which words you get depends on the set you are in:

| Set | Words | Rule |
| --- | --- | --- |
| Hiragana | 187 | Spelled with nothing but the 46 basic hiragana |
| Dakuten | 73 | Contains at least one ゛ or ゜ character |
| Katakana | 64 | Spelled with nothing but the 46 katakana |
| Combination | up to 324 | Anything spelled inside the ticked sets |

The **romaji** chip in the corner decides whether the reading is shown up front
or only after you answer. Off is the real practice; on is useful when you are
still slow and want the reading there as a check.

A word is only ever offered when every one of its characters is taught by the
set you are in, so you never meet a character the app has not shown you. That
rules out anything needing the small っ or ゃ ゅ ょ — no がっこう, no でんしゃ. For
katakana it also rules out the long mark ー and the katakana dakuten (ガ ザ ダ バ
パ), which unfortunately excludes コーヒー, テレビ and パン. Those come back when
those characters get sets of their own.

None of this is tagged by hand — a word's set is worked out from its characters,
so the lists cannot drift out of step.

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
| `app.js` | The logic — screens, choosing characters, scoring, the drawing pad. |
