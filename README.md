# Guild Wars 2 Achievement Tracker

A web application for tracking Guild Wars 2 achievements that award Mastery Points. Enter your API key to view and filter your progress across all mastery point achievements.

## Features

- View all achievements that award Mastery Points
- Filter achievements by completion status (All, Completed, Incomplete)
- Group achievements by mastery region (Core Tyria, Heart of Thorns, Path of Fire, etc.)
- Track progress with visual progress bars
- Store API key locally in browser for convenience
- Responsive design for mobile, tablet, and desktop

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Guild Wars 2 API key with "account" and "progression" permissions

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

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## How to Use

1. **Build the Achievement Database** (First Time Only)
   - Click the "Build Database" button
   - This indexes all ~8,000 GW2 achievements to find mastery point achievements
   - Takes ~30 seconds with a progress bar
   - **Saved in your browser** - only needs to be done once!
   - Click "Rebuild Database" anytime to refresh if new achievements are added

2. **Generate an API Key**
   - Go to https://account.arena.net/applications
   - Create a new API key with "account" and "progression" permissions
   - Copy the generated key

3. **Enter Your API Key**
   - Paste your API key into the input field
   - Optionally check "Remember API key" to save it in your browser
   - Click "Load Achievements"
   - Loads instantly after database is built!

4. **View and Filter**
   - Browse achievements grouped by mastery region
   - Use the filter buttons to show All, Completed, or Incomplete achievements
   - Track your overall progress with the summary at the top

## Security

- Your API key is stored locally in your browser using localStorage
- The key is never sent to any third-party servers
- All API calls are made directly from your browser to the official Guild Wars 2 API
- You can clear your stored API key at any time using the "Clear Key" button

## Technology Stack

- React 18 with TypeScript
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- Guild Wars 2 API v2

## API Endpoints Used

- `GET /v2/achievements` - Get all achievement IDs (database build only)
- `GET /v2/achievements?ids=1,2,3...` - Fetch achievement details in batches
- `GET /v2/account/achievements?access_token=KEY` - Fetch account achievement progress

### Performance Optimization

The app uses a smart two-phase approach:

**Phase 1: Build Database (Manual, One-Time)**
- Fetches all ~8,000 GW2 achievements to identify mastery point achievements
- Stores mastery achievement IDs in localStorage
- Progress bar shows real-time progress (~40 batches)
- Only needs to be done once per browser

**Phase 2: Load Your Achievements (Fast!)**
- Fetches only YOUR account's achievements
- Uses cached mastery IDs to filter instantly
- Fetches details for only ~50-100 mastery achievements you have
- **Loads in 1-2 seconds** instead of 30+ seconds!

## License

MIT

## Disclaimer

This is a fan-made tool and is not affiliated with or endorsed by ArenaNet or NCSOFT. Guild Wars 2 is a registered trademark of ArenaNet, LLC.
