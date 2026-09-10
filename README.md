# Hiragana Practice

A small web app for drilling the 46 basic hiragana on a phone. No install, no
libraries, no build step — just three files that a browser opens directly.

## How it is laid out

The app opens on a **main menu** with the two practice modes. Pick one, drill for
as long as you like, and tap **‹** to come back. Below them is the character
picker, showing how many of the 46 are currently switched on.

## Two modes

- **Identify (か → ka)** — a character appears, you tap the sound it makes. The three
  wrong answers are picked from look-alike characters and the same row, so it
  stays hard rather than guessable.
- **Write (ka → か)** — a sound appears, you draw the character with your finger,
  then tap **Show answer**. The real character fades in behind your drawing so
  you can compare shapes, and you mark yourself right or wrong.

## What it remembers

Progress is saved in the browser itself (localStorage), so it survives closing
Safari. Characters you get wrong come up more often; getting one right again
lowers its priority. The menu also lists the characters you miss most often.

## Choosing what to practise

The **Characters** screen is the gojūon chart as you would see it in a textbook:
the vowels `a i u e o` across the top, one row per consonant line down the side,
with the gaps left blank where a character does not exist (there is no "yi").

Tap any character to switch it on or off. Down the left is a button per row
(あ, か, さ …) and across the top one per vowel column — tap either to switch
that whole line. A small dot on each shows its state: filled means the line is
entirely on, an outline means part of it is, and faded means none of it is.

Tapping a line that is only half on fills it up rather than emptying it, which
is usually what you want part-way through choosing. **All** and **None** are in
the top corner.

### Easy or Harder

On the same screen is a switch for where the *wrong* answers come from:

- **Easy** (the default) — the wrong answers are only ever characters you have
  switched on. Turn on the か row alone and every question stays inside か き く
  け こ, which is what you want while you are still learning a row.
- **Harder** — the wrong answers can be any of the 46, including characters you
  have not switched on yet.

Either way, within whatever it is allowed to use, look-alike characters are
preferred over random ones — so あ tends to be offered against お and む.

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
| `data.js` | The gojūon chart, the 46 characters, and the look-alike groups. |
| `app.js` | The logic — screens, choosing characters, scoring, the drawing pad. |
