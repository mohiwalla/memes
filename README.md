# Meme Stash

Live site: [https://memes.mohiwalla.com/](https://memes.mohiwalla.com/)

Reaction memes. Searchable chaos. Exportable damage. Free-range emotional support PNGs.

This is a fast little meme browser for when your group chat needs a reaction image immediately and your camera roll looks like a digital landfill with a search problem. It lets you search through 100+ memes, open one in a deep-linkable modal, export it in different formats, and launch it into the chat like a tiny weaponized feeling.

It is not a meme editor. No captions. No top text. No bottom text. No "one more feature" that becomes a full SaaS in 3 months. Just search, click, export, send, heal, repeat, and pretend this counts as emotional regulation.

## What this thing actually does

- Searches across meme filenames, titles, and tags with fuzzy-ish ranking.
- Stores search state in the URL with `?q=` so links are shareable and reload-safe.
- Stores the selected meme in the URL with `?meme=` so the modal can deep-link too.
- Exports static memes as `png`, `jpg`, or `webp`.
- Keeps GIFs as GIFs instead of committing format crimes.
- Uses native share when the browser/device supports it.
- Renders a virtualized, animated grid so the UI stays smooth and dramatic.

## Why this exists

Because "I know I have the perfect reaction image somewhere" is not a search strategy.

Also because scrolling through 9,000 random screenshots to find one smug cat is how villains are made, and we as a society have enough villains already.

This repo is basically:

- one part useful utility
- one part frontend polish
- one part "works on my machine" with better typography
- one part me refusing to let meme retrieval become a manual database query performed by my thumbs

If bug appears, there is a non-zero chance bug was me. Ancient developer proverb.

Every codebase starts as "small fun side project" and ends with one config file staring back like it knows what you did. This one still mostly smiles.

## Run it locally before it runs you

### Prerequisite

This project is Bun-first. Use Bun.

If you use `npm` here, repo probably will not explode immediately, but it will look at you like blinking white guy GIF and quietly update your obituary.

Install dependencies:

```bash
bun install
```

Start dev server:

```bash
bun dev
```

Build production bundle:

```bash
bun run build
```

Preview production build locally:

```bash
bun run preview
```

Useful extra commands:

```bash
bun run lint
bun run format
```

## Tiny architecture tour for curious goblins

The app is a Vite + React + TypeScript single-page app with Tailwind styling, Framer Motion animations, and URL state managed through `nuqs`.

So yes, this is modern frontend. There are enough tools here to frighten a 2017 developer into the woods.

Important spots:

- `src/app` - app entry, routes, layout, page shell
- `src/components` - UI pieces like header, grid, footer, and export modal
- `src/hooks/use-meme-browser.ts` - search state, URL params, modal open/close behavior
- `src/lib/memes-database.ts` - meme titles and tags
- `src/lib/utils.ts` - search scoring, asset URL builder, download helpers
- `public/assets` - actual meme files, the sacred vault

## Environment gremlin

This app loads meme assets from `VITE_CDN_URL`.

Current env setup in repo:

- `.env` uses `https://cdn.jsdelivr.net/gh/mohiwalla/memes@main/public/assets`
- `.env.local` uses `/assets`

What that means:

- local/dev expects files from `public/assets`
- deployment expects meme files from the configured asset base URL

So yes, there is a tiny goblin in the asset pipeline. We know where he lives, at least. That already puts us above industry average.

## Deployment lore, but readable and only slightly cursed

The live app is here:

[https://memes.mohiwalla.com/](https://memes.mohiwalla.com/)

What the repo proves about deployment:

- The app is served on a custom domain via `CNAME`.
- SEO files point at the same domain:
  `index.html`, `public/robots.txt`, and `public/sitemap.xml`.
- The frontend is a static Vite build.
- Meme asset URLs are resolved at runtime from `VITE_CDN_URL`.

Important deploy gotcha:

`vite.config.ts` removes meme files from `dist/assets` after build.

That means self-hosting is not "build and vibe." It is "build, squint, inspect network tab, question life choices, then vibe later."

If you deploy this somewhere else, you need one of these:

1. A CDN or external asset base URL that serves the files.
2. A change to the Vite build behavior so assets are not stripped from `dist`.

If production images do not load, deployment has entered its classic phase: betrayal.

This is one of those fun frontend moments where everything is technically static, spiritually dynamic, and emotionally on fire.

## How deep links work

This app keeps state in the URL, which is actually nice and not just "look ma, query params."

- `?q=` stores the current search term
- `?meme=` stores the selected meme filename

Examples:

- `https://memes.mohiwalla.com/?q=cat`
- `https://memes.mohiwalla.com/?q=cat&meme=bund-mraa.png`

This makes the app reload-safe, shareable, and mildly smarter than the average "open modal, lose everything, cry" experience.

In other words: browser back button works like a civilized member of society instead of a jump scare.

## Add a new meme without summoning merge conflict demons

Want to add another cursed artifact to collection? Good. Here is the actual flow.

1. Drop the file into `public/assets`.
2. Add an entry in `src/lib/memes-database.ts`.
3. Give it:
   - a readable `title`
   - useful `tags` people might actually search for
4. Run the app and make sure:
   - it shows up in the grid
   - search finds it
   - opening it works
   - export/share still behaves normally

That is it. No database migration. No admin panel. No Kubernetes. Peace at last.

Your commit message can be funny. Your tags should not be useless. "lol" is not metadata. That is a cry for help.

## Troubleshooting, aka things that will absolutely happen at 2 AM

### Images load locally but not in production

Check `VITE_CDN_URL`.

Production relies on runtime asset hosting, and the build strips copied meme assets from `dist`. If the asset base URL is wrong, missing, or not publicly serving the files, the app will lovingly render broken images, silence, and the sound of your soul leaving your body.

### Search link works, but selected meme is weird or missing

`?meme=` expects an actual meme filename from the library. If the filename is wrong or no longer exists, the app clears the invalid selection. Which is fair, honestly.

### I changed a file in `public/assets`, but search is bad

Adding the file is not enough. Add good metadata in `src/lib/memes-database.ts` too. Search uses title + tags + normalized filename, not telepathy.

Computers are amazing, but they still refuse to infer "weird dog side-eye reaction" from your aura.

### Can I deploy this anywhere?

Probably yes, because it is a static frontend. But you must handle asset hosting correctly. This is the part where "simple deployment" becomes a character-building exercise.

Or, in dev terms: "it’s just static files" right before 90 minutes of forensic archaeology.

## Feature summary for people who read README like patch notes

- 100+ reaction memes, GIFs, and images
- keyboard-friendly search
- URL-powered state
- animated grid with virtualization
- export presets for emoji/small/medium/original sizing
- format conversion for static images
- GIF-safe download behavior
- share support on capable devices

## Notes from battlefield

- No license file is present in this repo right now.
- No CI/CD workflow is documented in this repo right now.
- Pre-commit hook exists, but it is basically a sleeping dragon at moment.
- Commit messages like `fix stuff` work technically, but spiritually they are a bug.
- If git ever says "automatic merge failed", congrats: you and computer now share custody of problem.
- If something says "temporary workaround", assume it has survived at least one season and pays rent.

## Final words before you `bun dev`

This project is intentionally small, useful, and slightly unserious in all right ways.

If you came here to grab a meme fast: blessed.

If you came here to contribute: welcome.

If you came here after debugging asset paths for 45 minutes: same. Sit down. Hydrate. We ride again.

May your builds be green, your diffs be small, your tags be searchable, and your production deploys avoid becoming true crime documentaries.
