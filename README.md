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

Tap any character to switch it on or off. Tap a row label (あ, か, さ …) to do
the whole row at once — useful when you are working through one line at a time.
**All** and **None** are in the top corner. Only switched-on characters are asked,
but the wrong answers in Identify are still drawn from the full alphabet, so
narrowing down to one row does not make the choices trivially easy.

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

The live site updates itself within a minute. If your phone still shows the old
version, pull the page down to refresh.

## The files

| File | What it does |
| --- | --- |
| `index.html` | The page structure — the four screens and their buttons. |
| `style.css` | All the appearance. Follows your phone's light/dark setting. |
| `data.js` | The gojūon chart, the 46 characters, and the look-alike groups. |
| `app.js` | The logic — screens, choosing characters, scoring, the drawing pad. |
