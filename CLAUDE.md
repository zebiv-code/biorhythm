# Biorhythm

Interactive biorhythm chart showing physical, emotional, and intellectual cycles.

## Structure

```
web/
├── index.html       — Entry point
├── css/             — Styles
├── js/              — ES modules
├── favicon.ico      — Site icon
└── thumb.png        — Card thumbnail (256×256)
```

## Tech

- Vanilla HTML/CSS/JavaScript — no build step
- ES module imports (`type="module"`)
- MIT licensed

## Development

```bash
npm start            # Serves web/ on localhost:3000
```

## Deployment

Deployed to zebiv.com via Cloudflare Workers. The `_web/` project syncs `web/` into `public/{slug}/app/`.

## Git

- Remotes: `local` (bare repo) and `github` (zebiv-code org)
- Squash to single commit before force-pushing
- Never mention Claude in commit messages
