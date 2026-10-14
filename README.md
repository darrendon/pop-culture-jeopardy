# Pop Culture Jeopardy

A Jeopardy game player for custom trivia nights, with sound cues and picture, audio and video clues. It's a fork of Brian Yu's [Jeopardy Player](https://github.com/brianyu28/jeopardy).

The site rebuilds and republishes itself on GitHub Pages whenever you change a file on the `main` branch, usually within two minutes.

## Playing

Open the site, click **Pop Culture Jeopardy** (or load any game file), add players, then click through the board. Keyboard shortcuts for the host:

- **Space / Enter:** reveal the next category, show the answer, or continue
- **Escape:** go back to the board
- **M:** mute or unmute sounds

You can also link straight to a game with `?game=pop_culture` at the end of the site address.

## Editing the game

The board lives in `src/games/pop_culture.json`. Edit it on github.com with the pencil icon and commit; the site updates on its own.

Each clue looks like this:

```json
{
    "value": 400,
    "clue": "This musical tells the untold story of the witches of Oz",
    "solution": "What is Wicked?"
}
```

Add `"dailyDouble": true` to make a clue a Daily Double.

## Picture, audio and video clues

Upload the file into the `public/media/` folder, then point to it from the clue:

```json
{
    "value": 800,
    "clue": "Name the band behind this album cover",
    "image": "media/album_cover.jpg",
    "solution": "What is Fleetwood Mac?"
}
```

| Field | What it does |
| --- | --- |
| `image` | Shows a picture under the clue |
| `audio` | Plays an audio clip under the clue, with controls |
| `video` | Plays a video under the clue, with controls |
| `solutionImage` | Shows a picture with the correct response |

Any of these can also be a full web address. Clicking the media won't reveal the answer, so you can press play or scrub freely. Final Jeopardy supports the same fields.

## Sound cues

Sound files live in `public/sounds/`. Which file plays when is set at the top of `src/util/sounds.ts`:

| Moment | File |
| --- | --- |
| Single Jeopardy starts | `single.mp3` |
| Double Jeopardy starts | `single.mp3` |
| Final Jeopardy category appears | `single.mp3` |
| A Daily Double is revealed | `dailydouble.mp3` |
| Final Jeopardy clue, until the answer is revealed | `final.mp3` |

Any file that's missing is skipped. Round music stops when you open a clue.

## Game file format

- `game.single` and `game.double`: arrays of 6 categories, each with a `category` name and 5 `clues`
- `game.final`: an object with `category`, `clue` and `solution`
- Each clue: `value`, `clue`, `solution`, plus optional `dailyDouble`, `html` (treat text as HTML), `image`, `audio`, `video` and `solutionImage`

## Running it on your own computer

```
npm install
npm start
```
