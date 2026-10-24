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

/** The championship scoreboard that's always at the top. Each finished level scores points. */
export const scoreboard = {
  eyebrow: 'BIRTHDAY CHAMPIONSHIP',
  title: 'AURE’S ROAD TO 22 🏀',
  tagline: '11 challenges. One birthday MVP.',
  homeTeam: 'AURE',
  awayTeam: 'THE WORLD',
  /** 11 levels × 2 points = 22 */
  pointsPerLevel: 2,
};

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
    instructions: 'Remember when we were obsessed with Sudoku? ⚠️ Warning: 3 mistakes and it resets!',
    success: 'Big brain! Almost as good as I am 🥱',
  },
  3: {
    title: 'The Duck Claw Machine',
    emoji: '🦆',
    instructions: 'The legendary duck-catching champion returns! The ducks won’t sit still, and only the RAINBOW ducks count. Catch both! Move with ◀ ▶ (or ← → keys) and hit DROP (or Space).',
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
    instructions: 'Oh no, we’ve been scrambled into 30 pieces! Click a piece, then click where it goes on the board. Pieces only fit in their real spot.',
    success: 'Back together, just how we should be. 🥰',
  },
  6: {
    title: 'Hell’s Kitchen: Service!',
    emoji: '👨‍🍳',
    instructions: 'Orders are coming in, Chef! Tap the ingredients in the right order before each ticket runs out. Serve 6 dishes. Get 3 sent back and you’re out of the kitchen!',
    success: 'Congratulations, Chef Aure. You’ve earned your first Michelin star in making Bao happy.',
  },
  7: {
    title: 'Whack-a-Bao: Friends Edition',
    emoji: '🔨',
    instructions: 'Our friends are trying to crash your birthday! Whack them back into their holes. Score 22 points in each of the 3 mini levels, and it gets faster every time!',
    success: 'Party crashers handled. They’ll be back for cake though. 🔨😂',
  },
  8: {
    title: 'Spot the Bao',
    emoji: '🔍',
    instructions: '11 tiny baos are hiding in this picture. Find them all! Tap a bao when you spot it. (Use the zoom button if your eyes need help.)',
    success: 'Bao radar: fully operational. (The best Bao is right here though. 🥰)',
  },
  9: {
    title: 'Our 8-Ball Showdown',
    emoji: '🎱',
    instructions: 'Pot the balls IN ORDER: 1, 2, 3… all the way to 7, then the black 8-ball. Pot the wrong one and it’s a re-rack! Drag back from the white ball like a slingshot, then let go.',
    success: '8-ball, corner pocket. Called it. 😎 (I’m still winning the next real one though.)',
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
 *  Level 1 — Quiz   (3–5 questions, 4 options each)
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
    question: 'What does Baozers think Aure’s most adorable habit is?',
    options: [
      '“okay lor guess im just fat and ugly” *pouts*',
      'that adorable little laugh when im TOO funny',
      'pretending that he has friends',
      'eyebrow raise with “what that mean?”',
    ],
    correctIndex: 1,
    correctFeedback: 'Correct! Can’t wait for it to evolve into the rich people laugh',
    wrongFeedback: 'NUH UH boooooooo',
  },
  {
    question: 'If Aure were an animal, which would Baozers say he is?',
    options: ['a sleepy cat', 'zesty unicorn', 'goofy retriever', 'pouty duck'],
    correctIndex: 2,
    correctFeedback: 'Correct! As zesty as you are, i still think youre my fluffy dog',
    wrongFeedback: 'NUH UH boooooooo',
  },
  {
    question: 'What is Aure’s superpower?',
    options: ['making her laugh at the worst moments', 'taking care of everything', 'incredibly big muscles', 'being impossibly comforting'],
    correctIndex: 3,
    correctFeedback: 'Correct! i know you wish c was the answer but sorry man youre just my favourite safe place',
    wrongFeedback: 'NUH UH boooooooo',
  },
];

/* ----------------------------------------------------------------------------
 *  Level 2 — Sudoku
 *  Use 0 for blank cells. Size can be 4, 6 or 9 (boxes: 2×2, 2×3, 3×3).
 *  The automated tests check that the puzzle has exactly one solution and
 *  that it matches `solution`. Run `npm test` after changing it.
 * ------------------------------------------------------------------------- */
export const sudoku = {
  size: 9,
  /** How many wrong numbers before the board resets. */
  maxMistakes: 3,
  // Medium-hard 9×9: 30 clues, one unique solution, solvable by logic alone (no guessing).
  puzzle: [
    [2, 0, 0, 3, 0, 0, 1, 9, 8],
    [3, 0, 0, 0, 9, 0, 0, 2, 0],
    [0, 0, 1, 2, 0, 5, 3, 0, 7],
    [0, 0, 0, 0, 0, 0, 0, 3, 0],
    [0, 0, 8, 0, 0, 6, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 8, 0, 0],
    [0, 6, 5, 0, 1, 0, 0, 8, 0],
    [0, 0, 7, 0, 0, 3, 0, 0, 6],
    [0, 3, 9, 6, 0, 0, 7, 0, 5],
  ],
  solution: [
    [2, 5, 4, 3, 6, 7, 1, 9, 8],
    [3, 7, 6, 1, 9, 8, 5, 2, 4],
    [9, 8, 1, 2, 4, 5, 3, 6, 7],
    [5, 9, 2, 8, 7, 4, 6, 3, 1],
    [7, 1, 8, 9, 3, 6, 4, 5, 2],
    [6, 4, 3, 5, 2, 1, 8, 7, 9],
    [4, 6, 5, 7, 1, 9, 2, 8, 3],
    [8, 2, 7, 4, 5, 3, 9, 1, 6],
    [1, 3, 9, 6, 8, 2, 7, 4, 5],
  ],
};

/** An easier 4×4 alternative — swap it in above if the 9×9 is too much. */
export const sudoku4 = {
  size: 4,
  maxMistakes: 3,
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
};

export const sudoku9 = {
  size: 9,
  maxMistakes: 3,
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
  /** Starting positions of the ducks, in % of the machine width (keep between 20 and 94). */
  duckPositions: [22, 31, 40, 49, 58, 67, 76, 86],
  /** Which ducks (0 = first) are rainbow ducks. */
  rainbowDucks: [2, 6],
  /** How many rainbow ducks he must catch to win. */
  rainbowToCatch: 2,
  /** Normal swimming speed (% of width per second). Bigger = harder. */
  duckSpeed: 15,
  /** Rainbow ducks' normal speed. */
  rainbowSpeed: 19,
  /** Ducks randomly speed up and slow down between these multiples of their normal speed. */
  slowest: 0.25,
  fastest: 2,
  /** How close (in % of width) the claw must be to a duck's centre to grab it. Bigger = easier. */
  catchTolerance: 5,
  /** Claw speed, in % of machine width per second. */
  clawSpeed: 38,
  missMessages: [
    'So close! That duck is extra slippery today. 🫧',
    'The duck dodged! Time it as it swims under you. 🎯',
    'Almost! Watch where the rainbow duck is going. 🌈',
    'Champion ducks need champion focus. You got this! 💪',
  ],
  wrongDuckMessages: [
    'Wrong duck! Only the RAINBOW one counts. 🌈',
    'Cute, but not shiny enough. Rainbow duck only! 🌈',
    'That’s a regular duck. We want the rainbow one! 😤',
  ],
  oneMoreMessage: 'One rainbow duck down! Now get the other one! 🌈',
  winMessage: 'GOT BOTH RAINBOW DUCKS! 🌈🦆🌈',
};

/* ----------------------------------------------------------------------------
 *  Level 4 — Memory cards  ✏️ SAMPLE (exactly 6 pairs works best)
 * ------------------------------------------------------------------------- */
/**
 * Each card shows an emoji, or one of the built-in drawings via `art` ('bao', 'duck' or 'basketball').
 */
export const memoryCards: { emoji?: string; art?: 'bao' | 'duck' | 'basketball'; label: string }[] = [
  { emoji: '🦆', label: 'Duck champion' },
  { emoji: '👶', label: 'babysitting nights' },
  { art: 'bao', label: 'Baozers' },
  { emoji: '🎵', label: 'WHERE HAVE YOU BEENNNNNN' },
  { emoji: '🎨', label: 'play-dough-off (which i won)' },
  { emoji: '🧋', label: 'fat dates' },
];
/** Milliseconds a mismatched pair stays face-up before flipping back. */
export const memoryFlipBackDelay = 900;

/* ----------------------------------------------------------------------------
 *  Level 5 — Jigsaw puzzle
 *  Put your photo in public/photos/ and change `image`, e.g. image: '/photos/us.jpg'
 *  The photo is cropped to fill the board (cols : rows shape), so keep faces near the middle.
 * ------------------------------------------------------------------------- */
export const jigsaw = {
  image: '/photos/us-puzzle.jpg',
  /** 6 × 5 = 30 pieces. Fewer = easier. */
  cols: 6,
  rows: 5,
};

/* ----------------------------------------------------------------------------
 *  Level 6 — Hell's Kitchen
 *  Each dish lists its ingredients in the order they must be added.
 *  Every ingredient needs an `id` (no spaces), an emoji and a label.
 * ------------------------------------------------------------------------- */
export const hellsKitchen = {
  dishesToServe: 6,
  /** Orders sent back before he's kicked out of the kitchen. */
  maxSentBack: 3,
  /** Seconds for the first ticket; each served dish makes the next one 1 second faster. */
  firstTicketSeconds: 15,
  fastestTicketSeconds: 9,
  /** Seconds lost for picking a wrong ingredient. */
  wrongPenaltySeconds: 2,
  dishes: [
    {
      name: 'Beef Wellington',
      emoji: '🥩',
      steps: [
        { id: 'beef', emoji: '🥩', label: 'Beef fillet' },
        { id: 'mushroom', emoji: '🍄', label: 'Mushroom duxelles' },
        { id: 'ham', emoji: '🥓', label: 'Prosciutto' },
        { id: 'pastry', emoji: '🥐', label: 'Puff pastry' },
      ],
    },
    {
      name: 'Pan-Seared Scallops',
      emoji: '🐚',
      steps: [
        { id: 'scallop', emoji: '🐚', label: 'Scallops' },
        { id: 'butter', emoji: '🧈', label: 'Butter' },
        { id: 'garlic', emoji: '🧄', label: 'Garlic' },
        { id: 'lemon', emoji: '🍋', label: 'Lemon' },
      ],
    },
    {
      name: 'Bao',
      emoji: '🥟',
      art: 'bao' as const,
      steps: [
        { id: 'bun', emoji: '🫓', label: 'Fluffy bun' },
        { id: 'pork', emoji: '🐷', label: 'Pork belly' },
        { id: 'cucumber', emoji: '🥒', label: 'Cucumber' },
        { id: 'peanut', emoji: '🥜', label: 'Peanuts' },
      ],
    },
  ],
  startLine: 'Right, listen up! Orders are coming in. Let’s go, let’s go!',
  wrongLines: ['WRONG! What is that?!', 'That’s not in the recipe, you donkey!', 'Are you trying to poison them?!', 'Look at the ticket!'],
  timeoutLines: ['IT’S RAAAW!', 'WHERE’S THE LAMB SAUCE?!', 'Too slow! It’s gone cold!', 'My gran could do better, and she’s dead!'],
  servedLines: ['Finally, some good food.', 'Beautiful. Stunning.', 'Yes, Chef! Service!', 'Now THAT is a dish.', 'Oh, hello! Lovely.'],
  loseLine: 'GET OUT OF MY KITCHEN! …okay fine, try again.',
  winLine: 'Congratulations, Chef Aure. You’ve earned your first Michelin star in making Bao happy.',
};

/* ----------------------------------------------------------------------------
 *  Game choices — pick between versions of a level
 *  (In `npm run dev` / the preview you can also flip these in the 🛠 Dev panel.)
 * ------------------------------------------------------------------------- */
export const gameChoices: {
  /** Level 4 card look: 'poker' = playing cards, 'classic' = pink basketball cards */
  memoryCards: 'poker' | 'classic';
} = {
  memoryCards: 'poker',
};

/* ----------------------------------------------------------------------------
 *  Level 7 — Whack-a-Bao: Friends Edition
 *  One friend per mini level. Photos live in public/photos/ (square crops work best).
 * ------------------------------------------------------------------------- */
export const whackAMole = {
  /** 4 × 4 = 16 holes */
  gridSize: 4,
  friends: [
    { name: 'Friend 1', photo: '/photos/friend-1.jpg' },
    { name: 'Friend 2', photo: '/photos/friend-2.jpg' },
    { name: 'Friend 3', photo: '/photos/friend-3.jpg' },
  ],
  /** One entry per mini level. visibleMs = how long a face stays up; spawnEveryMs = how often a new one pops up. */
  rounds: [
    { seconds: 30, targetScore: 22, visibleMs: 1150, spawnEveryMs: 560, maxUp: 3 },
    { seconds: 30, targetScore: 22, visibleMs: 900, spawnEveryMs: 450, maxUp: 4 },
    { seconds: 30, targetScore: 22, visibleMs: 720, spawnEveryMs: 370, maxUp: 4 },
  ],
  hitLines: ['BONK!', 'Back in your hole!', 'Not invited!', 'Shoo!', 'Bye!', 'Nope!'],
};

/* ----------------------------------------------------------------------------
 *  Level 8 — Spot the Bao
 *  Tiny baos are drawn on top of the photo. x / y are % across / down the
 *  picture; rot tilts the bao. Move them around to make it easier or harder.
 * ------------------------------------------------------------------------- */
export const spotTheBao = {
  image: '/photos/spot-bao.jpg',
  /** width ÷ height of the photo */
  aspectRatio: 1104 / 1232,
  /** Bao size, in % of the picture width. Smaller = harder. */
  baoSize: 2.8,
  /** How close (in % of the picture width) a tap must be to count. */
  hitRadius: 3.2,
  baos: [
    { x: 27, y: 6, rot: -20 },
    { x: 8, y: 13, rot: 15 },
    { x: 49, y: 10.5, rot: 0 },
    { x: 80, y: 4.5, rot: 25 },
    { x: 61, y: 25.5, rot: -10 },
    { x: 91, y: 29, rot: 12 },
    { x: 17, y: 33, rot: -25 },
    { x: 4, y: 41, rot: 8 },
    { x: 47, y: 58, rot: 18 },
    { x: 4, y: 88, rot: -12 },
    { x: 57, y: 95, rot: 30 },
  ],
};

/* ----------------------------------------------------------------------------
 *  Level 9 — 8-ball pool
 * ------------------------------------------------------------------------- */
export const poolGame = {
  /** Balls 1…N must be potted in order, then the 8-ball. 7 = a full set. Fewer = easier. */
  colouredBalls: 7,
  startMessage: 'Break shot! Then pot them in order: 1, 2, 3… then the 8. 💪',
  potMessages: ['Nice shot! 🎯', 'In the pocket! 😎', 'Ooh, smooth. 💗', 'Show-off. 🙄💕', 'Pool shark alert! 🦈'],
  missMessages: ['So close!', 'Unlucky! Try again.', 'Hmm, the pockets are over there. 😜', 'Line up the dotted line with a pocket!'],
  nowTheEight: 'All in order! Now sink the 8-ball. 🎱',
  /** {ball} = the ball he potted, {next} = the one he needed. */
  wrongOrder: 'Wrong ball! You potted the {ball} but needed the {next}. RE-RACK! 😈',
  breakRespot: 'Lucky break! The out-of-order balls go back on the table.',
  scratchMessage: 'Scratch! The white ball’s back on the table.',
  tooSoft: 'Drag back further for more power!',
  winMessage: 'GAME! You win… this time. 😤🎱',
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
