# GW2Mastery

A web application for tracking Guild Wars 2 achievements that award Mastery Points. Enter your API key to view and filter your progress across all mastery point achievements.

## Discord Channel

Want to make a bug report or feature request? Stop by the GW2 Development Community discord: https://discord.com/channels/384735285197537290/1481708473354948819

## Getting Started

### Installation

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

## Achievement Database

The Setup modal allows users to regenerate the achievement database using the latest data from the
GW2 API. However, achievementDb.json already contains the latest achievement data as of the time of
development, so users will only have to rebuild it themselves if new content is released and the app
hasn't been updated recently. The app will use whichever of the two is newer.

rawAchievementDb.json is a manual dump of the actual raw response from the achievements API, for use
in debugging/development, since the main achievement DB strips out fields and achievements it
doesn't need.

## Updating Achievement DB Jsons

1. Open Debug page and open the "Achievement DB Builder" view.
2. Run with the Raw checkbox toggled, and copy the results into `rawAchievementDb.json`.
3. Run again with the checkbox untoggled, and copy the results into `achievementDb.json`.
4. Open "Item Name DB Builder" view, run it, and copy into `itemNameDb.json`.
5. Open "Map Achievements Builder" view, run it, and copy into `mapAchievements.json`.

## Hosting / Deployments

This project is hosted on Cloudflare Pages, and auto-deploys pushes to the `main` branch.

## License

MIT

## Disclaimer

This is a fan-made tool and is not affiliated with or endorsed by ArenaNet or NCSOFT.
