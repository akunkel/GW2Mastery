# Mastery Achievement Database

This directory contains the default mastery achievement IDs that are bundled with the application.

## Updating the Database

When Guild Wars 2 adds new mastery achievements, you need to update the `masteryAchievementIds.json` file:

1. Open the application in development mode
2. Open the browser console (F12)
3. Go to Setup and click "Build Database"
4. Wait for the build to complete
5. The console will display the updated JSON array
6. Copy the entire JSON array from the console
7. Paste it into `src/data/masteryAchievementIds.json`
8. Update the timestamp in `src/utils/storage.ts` (line with `new Date('2026-01-14')`) to the current date
9. Commit and deploy the changes

## File Format

The `masteryAchievementIds.json` file should contain a JSON array of achievement IDs:

```json
[
  1234,
  5678,
  9012,
  ...
]
```

## Benefits

By bundling the default database:
- Users don't need to build the database on first load
- Reduces API calls to the GW2 API
- Faster initial load time
- Users can still rebuild if they want the latest data
