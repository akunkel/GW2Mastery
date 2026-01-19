# Achievement Database

This directory contains the bundled achievement data for the application.

## Updating the Database

When Guild Wars 2 adds new achievements or you want to refresh the data:

1. Open the application in development mode
2. Open the browser console (F12)
3. Go to Setup and click "Build Database"
4. Wait for the build to complete
5. The console will display the full minified JSON object
6. Copy the entire JSON output
7. Paste it into `src/data/achievementDb.json`
8. Commit and deploy the changes

## File Format

The `achievementDb.json` file contains a timestamped object with the achievement data:

```json
{
  "timestamp": 1234567890,
  "achievements": [
    {
      "id": 1234,
      "name": "Achievement Name",
      "requirement": "Do something",
      "icon": "https://...",
      "masteryRegion": "Maguuma",
      "bits": [{ "text": "Step 1" }]
    },
    ...
  ],
  "categories": [
    {
      "id": 1,
      "name": "Category Name",
      "description": "...",
      "order": 1,
      "achievements": [1234, 5678]
    },
    ...
  ],
  "groups": [
    {
      "id": "A1B2...",
      "name": "Group Name",
      "description": "...",
      "order": 1,
      "categories": [1, 2]
    },
    ...
  ]
}
```

## Benefits

By bundling the full database:

- Zero initial API calls for achievement details
- Instant load times
- Reduced API rate limiting issues
- Validated data structure at build time
