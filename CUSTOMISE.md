# ✏️ Customising the birthday quest

Nearly everything you'll want to change lives in **two files**, so you never have to touch game logic:

| What | Where |
|---|---|
| Password, welcome message, every level's title/instructions/success message, quiz, sudoku, claw, memory cards, puzzle photo, whack-a-mole, timeline, spot-the-difference, catch game, cake, finale, Wordle, clues | `src/content/content.ts` |
| The birthday letter | `src/content/letter.ts` |
| Photos | `public/photos/` |
| Colours | `tailwind.config.js` (`colors` section) |

Anything marked **✏️ SAMPLE** is placeholder content waiting for the real thing.

After you edit, run `npm test` (it catches mistakes such as a quiz answer index that's out of range or a Sudoku with two solutions), then `npm run dev` to look at it.

## Common edits

### Quiz questions (Level 1)
In `content.ts` → `quiz`. Use 3–5 questions. Each one has 4 `options`, and `correctIndex` is **0-based**: 0 is the first option, 3 is the last.

### Timeline (Level 7)
`timeline`: list the events **in the correct order, oldest first**. The game shuffles them. Dates stay hidden until he solves it.

### Memory cards (Level 4)
`memoryCards`: six items, each `{ emoji, label }` or `{ art: 'bao', label }` to use a built-in drawing (`'bao'`, `'duck'` or `'basketball'`). Each one becomes a pair.

### Your photos
1. Put the image files in `public/photos/`, e.g. `public/photos/us.jpg`. Avoid spaces in file names.
2. **Sliding puzzle (Level 5):** set `slidingPuzzle.image: '/photos/us.jpg'`. Use a **square** photo, or it will look stretched. Pick one with lots of detail so the tiles are distinguishable.
3. **Gallery (Level 11):** edit `finale.gallery`. Each entry is `{ src: '/photos/xyz.jpg', caption: '...' }`. Use `[]` to hide the gallery.
4. Delete the placeholder SVGs if you like.

Keep photos under about 1–2 MB each so the site loads quickly. Phone photos can be shrunk at https://squoosh.app.

### The letter (Level 11)
`src/content/letter.ts`: each string in `paragraphs` is one paragraph. Use `\n` inside a string for a line break. Apostrophes are fine inside `'…'` strings if you use the curly kind (’). For a straight one, write `\'`.

### Difficulty
- Sudoku: the 9×9 is medium-hard; `sudoku4` is an easy 4×4 backup, and `maxMistakes` sets how many wrong numbers reset the board. The tests verify any puzzle you paste in.
- Claw machine: `duckSpeed` / `rainbowSpeed` (smaller = easier), `catchTolerance` (bigger = easier), `rainbowDuck` (which duck is the rainbow one) and `clawSpeed`.
- Sliding puzzle: `shuffleMoves` (30 = gentle, 80 = tricky).
- Whack-a-mole: `targetScore`, `durationSeconds`, `visibleMs`.
- Pool: `poolGame.colouredBalls` (fewer = easier).
- Poker: `pokerGame.baozersHand` (her hand) and `luckyAfterLosses`.
- Level 6 / memory card style: `gameChoices` picks poker or the original version.

### Spot the difference with your own pictures
Set `imageA`/`imageB` to two versions of a picture in `public/photos/`, set `aspectRatio` to width ÷ height, and update `differences`. Each one is `x`/`y` (% across/down) plus `r` (click radius as % of width). To find coordinates, open the image in any editor and divide the pixel position by the image size.

### Colours
In `tailwind.config.js` you can edit the `blush` (pinks), `berry` (burgundy), `cream`, `honey`, `sage` and `cocoa` shades.

## Before you send it 💌
1. Replace the sample quiz, letter, photos and timeline.
2. Run `npm test` and `npm run build`.
3. Run `npm run preview` and play it through once as he will.
4. Deploy (see README.md) and open the live link on your phone to check it.
