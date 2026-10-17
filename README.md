# Pop Culture Jeopardy

A Jeopardy game player for custom trivia nights, with sound cues and picture, audio and video clues. It's a fork of Brian Yu's [Jeopardy Player](https://github.com/brianyu28/jeopardy).

The site rebuilds and republishes itself on GitHub Pages whenever you change a file on the `main` branch, usually within two minutes.

## Playing

Open the site, click **Episode 1** or **Episode 2** (or load any game file), have each of the 4 teams write their name in a box with a finger, stylus or mouse, then click through the board. The handwritten names show on the podiums. Keyboard shortcuts for the host:

- **Space / Enter:** reveal the next category, show the answer, or continue
- **Escape:** go back to the board
- **M:** mute or unmute sounds
- **T:** play the time's-up sound on an open clue (or click "Time's up")
- **P:** start or stop the Final Jeopardy think music (or click "Play think music")

You can also link straight to a game with `?game=pop_culture` (Episode 1) or `?game=pop_culture_2` (Episode 2) at the end of the site address.

## Host screen and board

The game can run on two windows at once:

- **Host screen** (the normal site address): everything you click and type, plus a yellow strip on each clue showing the correct response before you reveal it. On a Daily Double it also shows you the clue while the TV still says "Daily Double". Wagers and the score buttons stay here.
- **Board** (press **📺 Open board** in the bottom-right corner, or add `?view=board` to the site address): only what the room should see, with no buttons, no wager boxes and no answers until you reveal them. This is the window for the TV.

To put the board on the TV over HDMI, set the TV to **extend** (not mirror), drag the board window onto it, and press **F** on the board to go full screen. Unlike F11, this full screen doesn't bring the browser's toolbar or sidebar back when your mouse crosses over to the laptop. Both windows have to be open in the same browser on the same computer. The button turns into **📺 Board on** once they're connected, and if you reload the board it picks up right where the game is.

Sounds play from the host window and come out of whatever your computer's sound output is set to, so pick the TV as the output if you want the sound there.

If the board isn't open, everything still works from the host screen alone, just like before, with no answer strip.

## Editing the game

Episode 1 lives in `src/games/pop_culture.json` and Episode 2 in `src/games/pop_culture_2.json`. Edit it on github.com with the pencil icon and commit; the site updates on its own.

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
| Final Jeopardy think music, started by the host | `final.mp3` |
| Time's up button | `timesup.mp3` (a built-in buzzer plays if this file is missing) |

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
