/**
 * ============================================================================
 *  💝  CONTENT & SETTINGS — edit this file to personalise the website.
 * ============================================================================
 *
 *  Everything Aure reads (and most game difficulty settings) lives here, so
 *  you never need to touch the game logic. Things marked  ✏️ SAMPLE  are
 *  placeholders waiting for your real content.
 *
 *  The birthday letter lives in its own file:  src/content/letter.ts
 *  Photos live in:                              public/photos/
 *  Colours live in:                             tailwind.config.js
 *
 *  Emojis are fine anywhere you see text. Keep the quotes and commas intact!
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 *  People
 * ------------------------------------------------------------------------- */
export const people = {
  birthdayName: 'Aurelius',
  nickname: 'Aure',
  fromName: 'Lixuan',
  fromNickname: 'Baozers',
  age: 22,
  birthdayDate: 'October 28, 2026',
};

/** Little name shown in the top bar. */
export const siteTitle = "Aure's Birthday Quest";

/* ----------------------------------------------------------------------------
 *  Password gate
 * ------------------------------------------------------------------------- */
export const passwordGate = {
  /** Case-insensitive. Spaces are ignored, so "rainbow unicorn" also works. */
  answer: 'RAINBOWUNICORN',
  heading: 'Halt! Who goes there? 💌',
  prompt:
    'This little corner of the internet is for one very special birthday boy only. Prove it’s really you:',
  hint: '14 songs. 14 first letters. One secret word. 🎶',
  placeholder: 'Type the secret password…',
  button: 'Unlock 🔓',
  /** One of these is shown (in order, looping) after a wrong guess. */
  errorMessages: [
    'Hmm, not quite! Did you listen to every song? 🎧',
    'Nope! Baozers is giving you a very suspicious look right now 👀',
    'Close? Maybe? Try writing down the first letter of each song 📝',
    'Still no! Are you SURE you’re Aure? 🕵️‍♀️',
    'Hint: it’s something magical and very colourful 🌈',
  ],
  successMessage: 'Welcome, birthday boy! 💖',
};

/* ----------------------------------------------------------------------------
 *  Welcome screen
 * ------------------------------------------------------------------------- */
export const welcome = {
  heading: 'Happy 22nd Birthday, Aure!',
  // ✏️ SAMPLE — replace with your own welcome message (one string per paragraph).
  message: [
    'Hello my favourite person! I made you a little something. Okay… a not-so-little something. 🥹',
    'Ahead of you lie 11 levels — quizzes, puzzles, ducks, cake, and a few of our very own inside jokes. Beat each level to unlock the next one.',
    'There’s something waiting for you at the very end. No skipping, no cheating, and absolutely no asking me for answers. 😤💕',
  ],
  signoff: '— your Baozers 🐻',
  startButton: 'Start Your Adventure',
  continueButton: 'Continue Your Adventure',
};

/* ----------------------------------------------------------------------------
 *  Level titles, instructions & success messages
 * ------------------------------------------------------------------------- */
export interface LevelText {
  title: string;
  emoji: string;
  instructions: string;
  success: string;
}

export const levels: Record<number, LevelText> = {
  1: {
    title: 'How Well Do You Know My Aure?',
    emoji: '💭',
    instructions: 'A quiz about YOU — according to me. Pick the answer you think Baozers would choose. Wrong answers just mean you get to try again!',
    success: 'You know yourself almost as well as I do. Almost. 😌',
  },
  2: {
    title: 'Our Sudoku Era',
    emoji: '🔢',
    instructions: 'Remember when we were obsessed with Sudoku? Fill every row, column and box with each number exactly once. Click a cell, then pick a number (or use your keyboard).',
    success: 'Big brain energy! Our Sudoku era lives on. 🧠✨',
  },
  3: {
    title: 'The Duck Claw Machine',
    emoji: '🦆',
    instructions: 'The legendary duck-catching champion returns! Move the claw with the arrows (or ← → keys), then hit DROP (or Space) when you’re lined up with a duck.',
    success: 'The Duck Whisperer strikes again! China would be proud. 🏆',
  },
  4: {
    title: 'Memory Match',
    emoji: '🃏',
    instructions: 'Flip two cards at a time to find all six matching pairs of our favourite things and inside jokes.',
    success: 'Six for six! Your memory is as good as our memories. 💞',
  },
  5: {
    title: 'Put Us Back Together',
    emoji: '🧩',
    instructions: 'Oh no, we’ve been scrambled! Click a tile next to the empty space to slide it. Restore the picture to put us back together.',
    success: 'Back together, just how we should be. 🥰',
  },
  6: {
    title: 'Whack-a-Bao',
    emoji: '🔨',
    instructions: 'Little critters keep popping out of their holes! Tap as many as you can before time runs out. Golden stars are worth 3 points!',
    success: 'Lightning reflexes! Nobody escapes the birthday boy. ⚡',
  },
  7: {
    title: 'Our Relationship Timeline',
    emoji: '📅',
    instructions: 'Put our special moments in the right order, oldest at the top. Drag the cards, or use the ▲ ▼ buttons, then press “Check my order”.',
    success: 'Every one of these moments is one of my favourites. 💗',
  },
  8: {
    title: 'Spot the Difference',
    emoji: '🔍',
    instructions: 'Someone has been messing with our picnic! Find the 5 differences between the two pictures. Click them on either picture.',
    success: 'Eagle eyes! Nothing gets past you. 🦅',
  },
  9: {
    title: 'Catch My Love',
    emoji: '🧺',
    instructions: 'Catch the falling hearts in your basket! Dodge the broccoli, alarm clocks and homework — they’ll cost you points. Use ← → (or A / D), the buttons, or drag.',
    success: 'You caught every bit of my love. (There’s plenty more where that came from.) 💘',
  },
  10: {
    title: 'Decorate Your Birthday Cake',
    emoji: '🎂',
    instructions: 'No wrong answers here! Pick your frosting, add toppings, then tap the top of the cake to place candles. When it’s perfect, light them up and make a wish.',
    success: 'Wish made. I hope every single bit of it comes true. 🌟',
  },
  11: {
    title: 'Happy 22nd Birthday, Aure!',
    emoji: '💌',
    instructions: 'You made it to the end.',
    success: 'Happy birthday, my love.',
  },
};

/* ----------------------------------------------------------------------------
 *  Level 1 — Quiz   ✏️ SAMPLE QUESTIONS (3–5 questions, 4 options each)
 * ------------------------------------------------------------------------- */
export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  /** 0, 1, 2 or 3 — which option is correct. */
  correctIndex: number;
  /** Shown when he picks the right answer. */
  correctFeedback: string;
  /** Shown when he picks a wrong answer (he can then try again). */
  wrongFeedback: string;
}

export const quiz: QuizQuestion[] = [
  {
    question: '✏️ SAMPLE: What does Baozers think Aure’s most adorable habit is?',
    options: ['Humming while he thinks', 'Getting excited about food', 'Explaining things very seriously', 'All of the above, obviously'],
    correctIndex: 3,
    correctFeedback: 'Correct! It was a trick question — everything you do is adorable. 🥹',
    wrongFeedback: 'True… but not the WHOLE truth. Try again! 😏',
  },
  {
    question: '✏️ SAMPLE: If Aure were an animal, which would Baozers say he is?',
    options: ['A sleepy cat', 'A golden retriever', 'A very determined duck', 'A dramatic penguin'],
    correctIndex: 2,
    correctFeedback: 'Quack! A very determined duck, just like the ones you love catching. 🦆',
    wrongFeedback: 'Cute guess, but no! Think… claw machines. 👀',
  },
  {
    question: '✏️ SAMPLE: What is Aure’s superpower, according to Baozers?',
    options: ['Making her laugh at the worst moments', 'Finding the best food spots', 'Winning every claw machine', 'Being impossibly comforting'],
    correctIndex: 3,
    correctFeedback: 'Yes. You’re my favourite safe place. 💗',
    wrongFeedback: 'That’s definitely a talent… but not THE superpower. Try again!',
  },
  {
    question: '✏️ SAMPLE: What will Aure definitely say when he reads this question?',
    options: ['“Huh?”', '“Baozers you’re so silly”', '“I knew it.”', '“…can I see the answers?”'],
    correctIndex: 1,
    correctFeedback: 'I can hear you saying it right now. 😆',
    wrongFeedback: 'Ha! Nope. I know you too well. Try again.',
  },
];

/* ----------------------------------------------------------------------------
 *  Level 2 — Sudoku
 *  Use 0 for blank cells. Size can be 4, 6 or 9 (boxes: 2×2, 2×3, 3×3).
 *  The automated tests check that the puzzle has exactly one solution and
 *  that it matches `solution`. Run `npm test` after changing it.
 * ------------------------------------------------------------------------- */
export const sudoku = {
  size: 4,
  puzzle: [
    [1, 0, 0, 0],
    [0, 4, 1, 0],
    [0, 1, 0, 3],
    [0, 0, 2, 0],
  ],
  solution: [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 1, 4, 3],
    [4, 3, 2, 1],
  ],
  // Want a bigger challenge? Swap in this 9×9 (also verified by the tests):
  //   size: 9, puzzle: sudoku9.puzzle, solution: sudoku9.solution
};

export const sudoku9 = {
  size: 9,
  puzzle: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  solution: [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
};

/* ----------------------------------------------------------------------------
 *  Level 3 — Duck claw machine
 * ------------------------------------------------------------------------- */
export const clawMachine = {
  /** Horizontal positions of the ducks, in % of the machine width (keep between 22 and 92). */
  duckPositions: [26, 42, 58, 74, 89],
  /** How close (in % of width) the claw must be to a duck's centre to grab it. Bigger = easier. */
  catchTolerance: 6,
  /** Claw speed, in % of machine width per second. */
  clawSpeed: 38,
  missMessages: [
    'So close! That duck is extra slippery today. 🫧',
    'The duck dodged! Line the claw up right above it. 🎯',
    'Almost! Use the dotted line to aim. 🦆',
    'Champion ducks need champion focus. You got this! 💪',
  ],
  winMessage: 'GOT ONE! 🦆💛',
};

/* ----------------------------------------------------------------------------
 *  Level 4 — Memory cards  ✏️ SAMPLE (exactly 6 pairs works best)
 * ------------------------------------------------------------------------- */
export const memoryCards: { emoji: string; label: string }[] = [
  { emoji: '🦆', label: 'Duck champion' },
  { emoji: '🔢', label: 'Sudoku nights' },
  { emoji: '🥟', label: 'Baozers' },
  { emoji: '🌈', label: 'Rainbow unicorn' },
  { emoji: '✈️', label: 'Our China trip' },
  { emoji: '🧋', label: 'Bubble tea dates' },
];
/** Milliseconds a mismatched pair stays face-up before flipping back. */
export const memoryFlipBackDelay = 900;

/* ----------------------------------------------------------------------------
 *  Level 5 — Sliding photo puzzle
 *  Put your photo in public/photos/ (a SQUARE photo works best) and change
 *  `image` below, e.g. image: '/photos/us.jpg'
 * ------------------------------------------------------------------------- */
export const slidingPuzzle = {
  image: '/photos/placeholder-couple.svg',
  /** Number of random moves used to shuffle. Lower = easier (30 is gentle, 80 is tricky). */
  shuffleMoves: 40,
};

/* ----------------------------------------------------------------------------
 *  Level 6 — Whack-a-Bao
 * ------------------------------------------------------------------------- */
export const whackAMole = {
  durationSeconds: 30,
  targetScore: 15,
  /** How long a critter stays up (ms). Bigger = easier. */
  visibleMs: 1250,
  /** Time between new critters (ms). Smaller = more critters. */
  spawnEveryMs: 650,
};

/* ----------------------------------------------------------------------------
 *  Level 7 — Timeline   ✏️ SAMPLE — list in the CORRECT (oldest-first) order.
 *  They are shuffled automatically in the game.
 * ------------------------------------------------------------------------- */
export const timeline: { date: string; title: string; emoji: string; note: string }[] = [
  { date: 'December 24, 2025', title: 'Our first date', emoji: '🎄', note: 'A Christmas Eve I will never forget.' },
  { date: 'January 16, 2026', title: 'We officially became a couple', emoji: '💑', note: 'The best yes of my life.' },
  { date: 'July 15, 2026', title: 'Our six-month anniversary', emoji: '🥂', note: 'Half a year of us!' },
  { date: 'September 2026', title: 'Lixuan left for exchange in the UK', emoji: '🇬🇧', note: 'Far away, but never apart.' },
  { date: 'October 28, 2026', title: 'Aure’s 22nd birthday', emoji: '🎂', note: 'Today! Happy birthday, my love.' },
];

/* ----------------------------------------------------------------------------
 *  Level 8 — Spot the difference
 *
 *  By default this uses the built-in illustrated picnic scene (drawn in
 *  src/art/PicnicScene.tsx). To use your OWN two images instead:
 *    1. Put them in public/photos/, e.g. spot-a.jpg and spot-b.jpg
 *    2. Set imageA / imageB below, and aspectRatio to width ÷ height
 *    3. Update `differences`: x and y are % across / down the image,
 *       r is the click radius in % of the image width.
 * ------------------------------------------------------------------------- */
export const spotTheDifference: {
  imageA: string | null;
  imageB: string | null;
  aspectRatio: number;
  differences: { x: number; y: number; r: number; label: string }[];
} = {
  imageA: null,
  imageB: null,
  aspectRatio: 4 / 3,
  differences: [
    { x: 85, y: 16, r: 9, label: 'The sun got some cool sunglasses 😎' },
    { x: 16, y: 21, r: 8, label: 'The balloon changed colour 🎈' },
    { x: 49, y: 14, r: 9, label: 'The cloud turned into a heart ☁️💗' },
    { x: 21, y: 84, r: 8, label: 'The duck swam away 🦆' },
    { x: 40, y: 50, r: 7, label: 'Aure lost his party hat 🥳' },
  ],
};

/* ----------------------------------------------------------------------------
 *  Level 9 — Catch My Love
 * ------------------------------------------------------------------------- */
export const catchGame = {
  targetScore: 20,
  /** Points lost when an obstacle is caught. */
  obstaclePenalty: 2,
  /** Base fall speed (fraction of play-area height per second). */
  baseSpeed: 0.32,
  /** Chance (0–1) that a falling item is an obstacle. */
  obstacleChance: 0.22,
  obstacles: [
    { emoji: '🥦', quip: 'Ew, broccoli!' },
    { emoji: '⏰', quip: 'Not the 8am alarm!' },
    { emoji: '📚', quip: 'Homework?! On your birthday?!' },
    { emoji: '🌧️', quip: 'British weather!' },
  ],
};

/* ----------------------------------------------------------------------------
 *  Level 10 — Cake
 * ------------------------------------------------------------------------- */
export const cake = {
  /** Written on the plaque on the cake. Keep it short (≈ 18 characters). */
  plaque: 'Happy 22nd, Aure!',
  maxCandles: 22,
  wishPrompt: 'Make a wish, birthday boy… then blow! 🌬️',
  afterBlow: 'Yay!! Happy birthday!! 🎉',
};

/* ----------------------------------------------------------------------------
 *  Level 11 — Finale
 *  The letter itself lives in src/content/letter.ts
 * ------------------------------------------------------------------------- */
export const finale = {
  heading: 'Happy 22nd Birthday, Aure!',
  subheading: 'You did it — all 10 levels! This last one is just for you.',
  envelopeLabel: 'For Aure — open me 💌',
  galleryTitle: 'A few of my favourite moments',
  /** ✏️ SAMPLE photos — put your photos in public/photos/ and update these. Leave the list empty [] to hide the gallery. */
  gallery: [
    { src: '/photos/gallery-1.svg', caption: '✏️ Our first date' },
    { src: '/photos/gallery-2.svg', caption: '✏️ The duck champion' },
    { src: '/photos/gallery-3.svg', caption: '✏️ Sudoku nights' },
    { src: '/photos/gallery-4.svg', caption: '✏️ Us, always' },
  ],
  bonusTitle: 'BONUS WORDLE',
  bonusText: 'One last puzzle… but not yet! Save this one for later on your birthday. 🤫',
  bonusButton: 'Open the Bonus Wordle ✨',
};

/* ----------------------------------------------------------------------------
 *  Bonus Wordle
 * ------------------------------------------------------------------------- */
export const wordle = {
  /** Letters only, no spaces or punctuation. */
  answer: 'ITSTIME',
  /** How the answer is split into tile groups (must add up to the answer length). */
  groups: [3, 4],
  /** How the answer is shown once solved. */
  display: 'IT’S TIME',
  maxGuesses: 6,
  title: 'The Bonus Wordle',
  intro: 'Seven letters. Two words. Six guesses. Any seven letters count as a guess, so go wild.',
  /** Revealed one at a time when he presses “Give me a clue”. */
  clues: [
    'It’s two words: the first has 3 letters, the second has 4.',
    'The first word is a contraction — there’s a sneaky apostrophe hiding in it.',
    'The second word is the thing we never seem to have enough of when we’re together.',
    'It starts with I… and ends with E.',
    'Say it out loud: “I _ ’ _   T _ _ E”',
  ],
  successMessage: 'Remember these words. You’ll know when to say them.',
  outOfGuesses: 'Out of guesses! Don’t worry — the board resets and your clues stay. Try again! 💪',
};

/* ----------------------------------------------------------------------------
 *  Decorative text
 * ------------------------------------------------------------------------- */
export const decorative = {
  footer: 'Made with an unreasonable amount of love by Baozers 🐻💗',
  lockedLevel: 'Finish the previous level to unlock this one! 🔒',
};
