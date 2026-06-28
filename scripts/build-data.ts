/**
 * Regenerates the bundled GW2 data snapshots in src/data/ from the live GW2 API.
 *
 * Run with:  npm run build:data
 *
 * Re-derives everything in a single in-memory pass — the operator does not need to know what
 * the game update changed. Writes the three runtime files (achievementDb.json, continentDb.json,
 * mapAchievements.json), preserves each file's timestamp when its payload is otherwise unchanged
 * (so a no-op refresh produces an empty git diff), and prints a report flagging anything that may
 * need a manual follow-up (new historical categories, unresolved item names, unmatched maps).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import historicalCategories from '../src/data/historicalCategories.json' with { type: 'json' };
import {
  fetchAchievementData,
  toAchievementDatabase,
} from '../src/database/buildAchievementDatabase';
import { buildContinentDatabase } from '../src/database/buildContinentDatabase';
import { buildItemNameDatabase } from '../src/database/buildItemNameDatabase';
import { buildMapAchievements } from '../src/database/buildMapAchievements';
import type { AchievementDatabase } from '../src/types/achievement';
import type { ContinentDatabase } from '../src/types/map';

const DATA_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const LANG = 'en';

function readRaw(fileName: string): string | null {
  try {
    return readFileSync(join(DATA_DIR, fileName), 'utf8');
  } catch {
    return null;
  }
}

function loadExisting<T>(fileName: string): T | null {
  const raw = readRaw(fileName);
  return raw === null ? null : (JSON.parse(raw) as T);
}

/**
 * Writes `value` as minified JSON. For timestamped databases, reuses the previous timestamp when
 * the rest of the payload is unchanged so a no-op refresh leaves an empty git diff. Returns whether
 * the file content actually changed.
 */
function writeData(fileName: string, value: unknown, prevTimestamp?: number): boolean {
  const previous = readRaw(fileName);
  let next = JSON.stringify(value);

  if (
    prevTimestamp !== undefined &&
    previous !== null &&
    value !== null &&
    typeof value === 'object' &&
    'timestamp' in value &&
    stripTimestamp(next) === stripTimestamp(previous)
  ) {
    next = JSON.stringify({ ...(value as Record<string, unknown>), timestamp: prevTimestamp });
  }

  writeFileSync(join(DATA_DIR, fileName), next);
  return next !== previous;
}

function stripTimestamp(json: string): string {
  try {
    const obj = JSON.parse(json) as Record<string, unknown>;
    delete obj.timestamp;
    return JSON.stringify(obj);
  } catch {
    return json;
  }
}

function diffIds(prev: number[], next: number[]): { added: number[]; removed: number[]; } {
  const prevSet = new Set(prev);
  const nextSet = new Set(next);
  return {
    added: next.filter((id) => !prevSet.has(id)),
    removed: prev.filter((id) => !nextSet.has(id)),
  };
}

function preview(ids: (number | string)[], limit = 25): string {
  if (ids.length <= limit) return ids.join(', ');
  return `${ids.slice(0, limit).join(', ')}, … (+${ids.length - limit} more)`;
}

async function main(): Promise<void> {
  const oldAchievementDb = loadExisting<AchievementDatabase>('achievementDb.json');
  const oldContinentDb = loadExisting<ContinentDatabase>('continentDb.json');
  const oldMapAchievements = loadExisting<Record<string, number[]>>('mapAchievements.json');

  // 1. Continent database (independent of achievements).
  console.log('Fetching continent data…');
  const continentDb = await buildContinentDatabase({
    lang: LANG,
    onProgress: (m) => console.log(`  ${m}`),
  });

  // 2. Achievements + categories (filtered raw data kept in memory).
  console.log('Fetching achievements…');
  const { rawAchievements, categories, allCategories } = await fetchAchievementData(LANG, (c, t) =>
    process.stdout.write(`\r  batch ${c}/${t}`)
  );
  process.stdout.write('\n');

  // 3. Item names (live /items), in memory — never persisted.
  console.log('Resolving item names…');
  const { names: itemNames, unresolvedIds } = await buildItemNameDatabase(rawAchievements);

  // 4. Processed achievement database.
  const achievementDb = toAchievementDatabase(rawAchievements, categories, itemNames);

  // 5. Map → achievement matches.
  const mapAchievements = buildMapAchievements(continentDb, rawAchievements);

  // ---- Write outputs (minified; timestamp preserved on no-op) ----
  const changes = {
    'continentDb.json': writeData('continentDb.json', continentDb, oldContinentDb?.timestamp),
    'achievementDb.json': writeData('achievementDb.json', achievementDb, oldAchievementDb?.timestamp),
    'mapAchievements.json': writeData('mapAchievements.json', mapAchievements),
  };

  // ---- Report ----
  console.log('\n=== Build report ===');

  // Achievements
  console.log(`\nAchievements: ${achievementDb.achievements.length}`);
  if (oldAchievementDb) {
    const { added, removed } = diffIds(
      oldAchievementDb.achievements.map((a) => a.id),
      achievementDb.achievements.map((a) => a.id)
    );
    console.log(`  added:   ${added.length ? preview(added) : 'none'}`);
    console.log(`  removed: ${removed.length ? preview(removed) : 'none'}`);
  }

  // New categories that look historical/retired but aren't excluded yet.
  const historicalSet = new Set(historicalCategories.categories);
  const suspiciousCategories = allCategories.filter(
    (c) => /\b(historical|retired)\b/i.test(c.name) && !historicalSet.has(c.id)
  );
  if (suspiciousCategories.length) {
    console.log('\n⚠ Categories that look historical but are NOT in historicalCategories.json:');
    for (const c of suspiciousCategories) console.log(`  ${c.id}  ${c.name}`);
    console.log('  → consider adding their IDs to src/data/historicalCategories.json');
  }

  // Item bits that actually fall back to a generic "Item N" label (no inline text AND the
  // item ID wasn't returned by /items). This is the real, actionable subset of unresolvedIds —
  // most unresolved IDs belong to bits that already carry inline text from the API.
  const fallbackItemIds = new Set<number>();
  for (const a of rawAchievements) {
    for (const b of a.bits ?? []) {
      if (b.type === 'Item' && !b.text && b.id != null && itemNames[b.id] === undefined) {
        fallbackItemIds.add(b.id);
      }
    }
  }
  console.log(`\nItem IDs not in /items catalog: ${unresolvedIds.length} (informational)`);
  if (fallbackItemIds.size) {
    console.log(`⚠ ${fallbackItemIds.size} item bit(s) end up shown as "Item N" (no name available):`);
    console.log(`  ${preview([...fallbackItemIds])}`);
  }

  // Public maps with no mastery region. The core cities/hubs (Lion's Arch, etc.) are a stable
  // baseline; only maps newly missing a region since the last build are actionable.
  const collectUnmatched = (db: ContinentDatabase | null): Set<string> => {
    const set = new Set<string>();
    if (db) {
      for (const region of Object.values(db.floor.regions)) {
        for (const map of Object.values(region.maps)) {
          if (!map.masteryRegion) set.add(map.name);
        }
      }
    }
    return set;
  };
  const unmatchedMaps = collectUnmatched(continentDb);
  const prevUnmatched = collectUnmatched(oldContinentDb);
  const newlyUnmatched = [...unmatchedMaps].filter((n) => !prevUnmatched.has(n));
  console.log(`\nPublic maps with no mastery region: ${unmatchedMaps.size} (${[...unmatchedMaps].sort().join(', ')})`);
  if (newlyUnmatched.length) {
    console.log(`⚠ NEW unmatched map(s) — may need REGION_ZONES / excludedMapNames / floorIds update:`);
    console.log(`  ${newlyUnmatched.sort().join(', ')}`);
  }

  // Map-achievement matches
  const newZones = Object.keys(mapAchievements);
  console.log(`\nMap-achievement zones matched: ${newZones.length}`);
  if (oldMapAchievements) {
    const oldZones = new Set(Object.keys(oldMapAchievements));
    const gained = newZones.filter((z) => !oldZones.has(z));
    const lost = Object.keys(oldMapAchievements).filter((z) => !(z in mapAchievements));
    if (gained.length) console.log(`  zones gained matches: ${preview(gained)}`);
    if (lost.length) console.log(`  zones lost matches:   ${preview(lost)}`);
  }

  // File summary
  console.log('\nFiles:');
  for (const [file, changed] of Object.entries(changes)) {
    console.log(`  ${changed ? 'updated' : 'unchanged'}  ${file}`);
  }
  console.log('\nReview the git diff, sanity-check the warnings above, then commit.');
}

main().catch((err) => {
  console.error('\nbuild:data failed:', err);
  process.exit(1);
});
