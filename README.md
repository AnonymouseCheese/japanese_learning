# Hiragana Practice

A small web app for drilling the 46 basic hiragana on a phone. No install, no
libraries, no build step — just three files that a browser opens directly.

## Two modes

- **Read (か → ka)** — a character appears, you tap the sound it makes. The three
  wrong answers are picked from look-alike characters and the same row, so it
  stays hard rather than guessable.
- **Write (ka → か)** — a sound appears, you draw the character with your finger,
  then tap **Show answer**. The real character fades in behind your drawing so
  you can compare shapes, and you mark yourself right or wrong.

## What it remembers

Progress is saved in the browser itself (localStorage), so it survives closing
Safari. Characters you get wrong come up more often; getting one right again
lowers its priority. The **☰** menu lets you practise only certain rows — useful
if you are working through あ, か, さ one at a time — and shows the characters
you miss the most.

## On a desktop

The layout stays a centred phone-width column rather than stretching across the
monitor. You can drill with the keyboard instead of the mouse:

| Key | Does |
| --- | --- |
| `1` `2` `3` `4` | Pick that answer (read mode) |
| `space` | Show the answer (write mode) |
| `y` / `n` | Mark yourself right / wrong |
| `c` | Clear the drawing |
| `esc` | Close the settings menu |

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
| `index.html` | The page structure — the two tabs, the card, the buttons. |
| `style.css` | All the appearance. Follows your phone's light/dark setting. |
| `data.js` | The 46 characters, their sounds, and the look-alike groups. |
| `app.js` | The logic — choosing characters, scoring, the drawing pad. |
