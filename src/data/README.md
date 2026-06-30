# Bundled data

This directory holds the data the app loads at startup. Three files are **generated** from
the live GW2 API; the rest are **hand-maintained**.

## Generated (do not edit by hand)

| File | Contents |
| --- | --- |
| `achievementDb.json` | Processed achievements + categories (the main database). |
| `continentDb.json` | Public maps/regions with mastery regions, for the world map. |
| `mapAchievements.json` | Zone name → achievement IDs (heuristic text match). |
| `noveltyDb.json` | All novelties with cross-referenced achievement links, for the Toys page. |

### Refreshing them after a game update

```
npm run build:data
```

This re-derives all three files from the API in a single pass — you don't need to know what
the update changed. Raw achievements and item names are resolved in memory and never written
to disk. The script then prints a report; pay attention to the ⚠ warnings, which flag the
hand-maintained inputs a game update can silently invalidate:

- **Categories that look historical but aren't excluded** — add their IDs to
  `historicalCategories.json` if they should be hidden.
- **Unresolved item bits** (shown as `Item N`) — usually transient API gaps.
- **Public maps with no mastery region** — a new zone may need an entry in `REGION_ZONES`
  (`src/utils/regionHelpers.ts`), `excludedMapNames`, or the `floorIds` list in
  `src/database/buildContinentDatabase.ts`.

Unchanged files keep their previous `timestamp`, so a no-op refresh leaves an empty `git diff`.
Review the diff, sanity-check the warnings, then commit.

> The same build logic powers the in-app **Setup → Build Database** flow, which persists a
> fresh achievement/continent database to local storage for an instant refresh without a
> redeploy. Only `npm run build:data` updates the bundled JSON files in this directory.

## Hand-maintained

`historicalCategories.json` (category IDs to exclude), `achievementMetadata.ts`,
`recommendedMasteryAchievements.ts`, `mountDefinitions.tsx`, `guidesData.tsx`.
