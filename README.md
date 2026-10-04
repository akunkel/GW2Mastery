# GW2Mastery

A web application for tracking Guild Wars 2 achievements that award Mastery Points. Enter your
API key to see, filter, and plan your progress across every mastery point achievement in the
game — by expansion, by zone on an interactive world map, and by mount.

Live at **[www.gw2mastery.com](https://www.gw2mastery.com)**.

It's a client-only React SPA: there is no backend, no account, and no server storing your data.

## Getting Started

1. Clone this repository
2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open http://localhost:5173 in your browser

To see your own progress you'll need a
[Guild Wars 2 API key](https://account.arena.net/applications) with the `account` and
`progression` permissions, plus `unlocks` and `inventories` if you want mount tracking.

## Scripts

- **`npm run dev`** — Start the Vite dev server
- **`npm run build`** — `tsc -b && eslint . && vite build`; the source of truth for "is it
  broken"
- **`npm run lint`** — ESLint only
- **`npm run format`** — Prettier write over the repo
- **`npm run build:data`** — Regenerate the bundled data JSON from the live GW2 API

## Privacy

Your API key is stored in your browser's `localStorage` and nowhere else. It is sent only to
`api.guildwars2.com`. There is no backend, no database, no analytics, and no telemetry — clear
the key from the Setup modal (or clear site data) and nothing of yours remains. All of this is
visible in [`src/utils/storage.ts`](src/utils/storage.ts) and [`src/services/`](src/services/).

## Achievement Database

The app ships with a snapshot of the GW2 achievement catalog in
[`src/data/`](src/data/) so it works instantly without a lengthy API crawl on first load. After
a game update, regenerate it with:

```bash
npm run build:data
```

See **[`src/data/README.md`](src/data/README.md)** for what each file contains, how to read the
script's warnings, and which hand-maintained inputs a game update can silently invalidate.

The Setup modal also offers an in-app **Build Database** flow, which persists a fresh database
to local storage for an instant refresh without waiting on a redeploy. Only `npm run build:data`
updates the bundled JSON files in the repo.

When updating the database following a new major patch, check the
[Mastery wiki page](https://wiki.guildwars2.com/wiki/Mastery) to see whether the required mastery
points from the latest expansion still matches what's in `REQUIRED_MASTERY_POINTS`.

## Project Conventions

[`CLAUDE.md`](CLAUDE.md) documents the folder structure and naming conventions the codebase
follows. Worth a skim before opening a PR.

## Hosting / Deployments

Hosted on Cloudflare Pages, auto-deploying pushes to the `main` branch.

## Bugs and Feature Requests

Open a [GitHub issue](https://github.com/akunkel/GW2Mastery/issues), or stop by the project's
channel in the GW2 Development Community Discord:
https://discord.com/channels/384735285197537290/1481708473354948819

## License

[MIT](LICENSE) — for the **source code**.

The bundled Guild Wars 2 artwork under `src/assets/images/` and `public/` (expansion logos,
mount renders, map imagery) is the property of ArenaNet, LLC and NCSOFT Corporation, is used
here under ArenaNet's content terms, and is **not** covered by the MIT license. The Icebrood
Saga logo recolor is by
[u/KortasEE](https://www.reddit.com/r/Guildwars2/comments/j1ya99/icebrood_saga_logo_recolored_from_one_of_the/).

## Disclaimer

This is a fan-made tool and is not affiliated with or endorsed by ArenaNet or NCSOFT.
