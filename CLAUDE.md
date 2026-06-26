# GW2Mastery — Project Conventions

A Vite + React 19 + TypeScript SPA for tracking Guild Wars 2 mastery-point
achievements. This file records the structure and naming conventions the codebase
follows so they stay consistent over time.

## Commands

- `npm run dev` — start the Vite dev server (http://localhost:5173)
- `npm run build` — `tsc -b && eslint . && vite build` (typecheck + lint + bundle)
- `npm run lint` — ESLint only
- `npm run format` — Prettier write over the repo

`npm run build` is the source of truth for "is it broken": `tsconfig.app.json` enables
`noUnusedLocals` / `noUnusedParameters`, and the Vite checker plugin runs ESLint, so a
dangling import or unused symbol fails the build.

## Folder structure (`src/`)

| Folder            | Role |
| ----------------- | ---- |
| `pages/`          | Route-level screens, one subfolder per feature (`map/`, `mastery/`, `mounts/`, `guides/`, `debug/`). A feature folder may also hold its own feature-local sub-components co-located with the page. |
| `components/`      | Shared components. `components/ui/` = generic primitives (shadcn-style: Button, Card, Dialog, Tooltip). `components/common/` = shared GW2-domain components (AchievementCard, MountCard, Header, …). Top-level files = app-shell pieces (Layout, modals). |
| `services/`        | Low-level GW2 API wrappers (`*Api.ts`) plus small shared service data (`apiConfig.ts`, `languages.ts`). |
| `database/`        | Higher-level data assembly/retrieval built on `services/` — `build*Database.ts` fetch & transform from the API; `get*` load from localStorage or the bundled JSON. |
| `data/`            | Bundled/static data: hand-authored config (`*.ts`/`*.tsx`) and generated JSON snapshots (`*.json`, refreshed via the Setup → Build Database flow; see `src/data/README.md`). |
| `store/`           | Zustand store (`useAppStore.ts`) — app state + orchestration. |
| `hooks/`           | Reusable React hooks (`use*`). |
| `utils/`           | Pure, framework-agnostic helpers. |
| `types/`           | Shared TypeScript types/interfaces. |

## Naming conventions

- **Component files**: `PascalCase.tsx` everywhere, including `components/ui/`
  (e.g. `Button.tsx`, `AchievementCard.tsx`). No lowercase component files.
- **Non-component modules** (services, utils, hooks, data, types, store): `camelCase.ts`
  / `.tsx` (e.g. `useExplorerProgress.ts`, `regionHelpers.ts`, `guidesData.tsx`).
- **Spell out `Database`** in exported names and filenames (`getDatabaseAchievements`,
  `buildAchievementDatabase`, `AchievementDatabase`). The `Db` abbreviation is avoided in
  the public surface; local-variable shorthand like `db` / `rawDb` is fine. (The bundled
  JSON files — `achievementDb.json` etc. — keep their names; they're tied to the data
  workflow in `src/data/README.md`.)
- **API service files**: named `<domain>Api.ts`, named exports, functions prefixed
  `query*` (e.g. `queryAchievements`, `queryAccountMountTypes`).
- **Debug views**: `src/pages/debug/views/<name>View.ts`, each exporting a single
  `DebugViewConfig` const of the same name. Builder views use the `*BuilderView` suffix.
- **Function-name idioms**: `get*` (read), `save*` (persist), `clear*` (remove),
  `build*` (assemble), `set*` (store setters), `handle*` (event handlers), `use*` (hooks).
- **Types**: PascalCase, no `I`/`T` prefixes. Callback props are `on*`.
