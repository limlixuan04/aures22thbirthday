# ✏️ Customising the birthday quest

Nearly everything you'll want to change lives in **two files**, so you never have to touch game logic:

| What | Where |
|---|---|
| Password, welcome message, scoreboard, every level's title/instructions/success message, quiz, sudoku, claw, memory cards, jigsaw photo, Hell's Kitchen, whack-a-bao friends, spot the bao, pool, cake, finale, Wordle, clues | `src/content/content.ts` |
| The birthday letter (shown with the trophy after all 11 levels) | `src/content/letter.ts` |
| Photos | `public/photos/` |
| Colours | `tailwind.config.js` (`colors` section) |

Anything marked **✏️ SAMPLE** is placeholder content waiting for the real thing.

After you edit, run `npm test` (it catches mistakes such as a quiz answer index that's out of range or a Sudoku with two solutions), then `npm run dev` to look at it.

## Common edits

### Quiz questions (Level 1)
In `content.ts` → `quiz`. Use 3–5 questions. Each one has 4 `options`, and `correctIndex` is **0-based**: 0 is the first option, 3 is the last.

### Whack-a-Bao friends (Level 7)
`whackAMole.friends`: one `{ name, photo }` per mini level (photos in `public/photos/`, square crops). `rounds` sets each mini level's time, target (22) and speed.

### Memory cards (Level 4)
`memoryCards`: six items, each `{ emoji, label }` or `{ art: 'bao', label }` to use a built-in drawing (`'bao'`, `'duck'` or `'basketball'`). Each one becomes a pair.

### Your photos
1. Put the image files in `public/photos/`, e.g. `public/photos/us.jpg`. Avoid spaces in file names.
2. **Jigsaw (Level 5):** set `jigsaw.image: '/photos/us.jpg'`. The photo is cropped to fill a 6 × 5 board, so landscape or square photos work best, with faces near the middle. A photo with lots of detail and colour makes the pieces easier to tell apart.
3. **Gallery (trophy screen):** edit `finale.gallery`. Each entry is `{ src: '/photos/xyz.jpg', caption: '...' }`. Use `[]` to hide the gallery.
4. Delete the placeholder SVGs if you like.

Keep photos under about 1–2 MB each so the site loads quickly. Phone photos can be shrunk at https://squoosh.app.

### The letter (the trophy screen)
`src/content/letter.ts`: each string in `paragraphs` is one paragraph. Use `\n` inside a string for a line break. Apostrophes are fine inside `'…'` strings if you use the curly kind (’). For a straight one, write `\'`.

### Difficulty
- Sudoku: the 9×9 is medium-hard; `sudoku4` is an easy 4×4 backup, and `maxMistakes` sets how many wrong numbers reset the board. The tests verify any puzzle you paste in.
- Claw machine: `duckSpeed` / `rainbowSpeed` (smaller = easier), `catchTolerance` (bigger = easier), `rainbowDuck` (which duck is the rainbow one) and `clawSpeed`.
- Jigsaw: `jigsaw.cols` × `jigsaw.rows` pieces (6 × 5 = 30; 4 × 3 = 12 is gentle).
- Hell's Kitchen: `hellsKitchen.dishes` (dishes and their ingredients, in order), `dishesToServe`, `maxSentBack`, `firstTicketSeconds` and the chef's lines.
- Pool: `poolGame.colouredBalls` (balls 1…N go in order, then the 8; fewer = easier).
- Memory card style: `gameChoices.memoryCards` picks poker cards or the classic look.

### Spot the Bao (Level 8)
`spotTheBao.image` is the photo; `baos` lists where each tiny bao sits (`x` / `y` = % across / down, `rot` = tilt). `baoSize` (smaller = harder) and `hitRadius` (bigger = easier) set the difficulty.

### Colours
In `tailwind.config.js` you can edit the `blush` (pinks), `berry` (burgundy), `cream`, `honey`, `sage` and `cocoa` shades.

## Before you send it 💌
1. Replace the sample quiz, letter, photos and timeline.
2. Run `npm test` and `npm run build`.
3. Run `npm run preview` and play it through once as he will.
4. Deploy (see README.md) and open the live link on your phone to check it.
