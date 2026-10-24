# 💝 Aure's Birthday Quest

An 11-level birthday adventure (plus a bonus Wordle), built with React, TypeScript, Vite and Tailwind.

## Run it locally

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Open the link it prints (usually http://localhost:5173).

**Developer mode is ON automatically in `npm run dev`.** A 🛠 **Dev** button appears at the bottom-left. Use it to jump to any level, mark levels complete, open the Wordle, or reset everything. It is **not included** in the deployed site.

### Check the real (production) version

```bash
npm run build      # type-checks and builds into dist/
npm run preview    # serves the built site at http://localhost:4173
```

This is exactly what Aure will see: no dev panel and no level skipping.
Progress lives in your browser's localStorage. To start fresh, use the dev panel's *Reset everything* button, or open the site in a private window.

### Tests

```bash
npm test
```

The tests check the Wordle scoring (including repeated letters), check that the Sudoku puzzle has exactly one solution, check that the sliding puzzle always shuffles into a solvable layout, check the level-unlocking rules, and sanity-check the content file.

## Personalise it

See **[CUSTOMISE.md](./CUSTOMISE.md)**. Almost everything lives in `src/content/content.ts` and `src/content/letter.ts`.

## Deploy

The site is fully static and uses `#/` URLs, so it needs no server configuration.

### Option A: Netlify Drop (easiest, no account setup)
1. Run `npm run build`.
2. Go to https://app.netlify.com/drop and drag the **`dist`** folder onto the page.
3. You get a link straight away. In *Site configuration → Change site name* you can choose a nicer name, e.g. `aure-turns-22.netlify.app`.

### Option B: Vercel or Netlify from GitHub (redeploys automatically on every push)
1. Push this repository to GitHub.
2. **Vercel:** https://vercel.com/new → import the repo → it detects Vite → **Deploy**.
   **Netlify:** https://app.netlify.com/start → import the repo (`netlify.toml` already sets the build) → **Deploy**.
3. From then on, every push to `main` updates the live site.

### Links to send
- Main site: `https://YOUR-SITE/`
- Bonus Wordle (direct): `https://YOUR-SITE/#/bonus`

The bonus link only needs the password. It works on any device, even one where the levels were never played.

> ⚠️ The site is protected by a sentimental password puzzle, not real security. Anyone who reads the page source could find the answers, so share the link only with him.
