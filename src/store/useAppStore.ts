import { create } from 'zustand';
import { buildAchievementDatabase } from '../database/buildAchievementDatabase';
import { buildContinentDatabase } from '../database/buildContinentDatabase';
import { getContinentData } from '../database/getContinentData';
import { getDatabaseStatus } from '../database/getDatabaseStatus';
import { getDatabaseAchievements } from '../database/getDatabaseAchievements';
import { queryAccountAchievements } from '../services/accountAchievementsApi';
import { queryAchievementCategories } from '../services/achievementsApi';
import { queryAccountMountTypes } from '../services/mountsApi';
import type {
  AccountAchievement,
  Achievement,
  AchievementCategory,
  AchievementGroup,
} from '../types/achievement';
import type { EnrichedAchievement, EnrichedCategory, EnrichedGroup } from '../types/enriched';
import type { ContinentDatabase } from '../types/map';
import { buildEnrichedHierarchy } from '../utils/enriched';
import {
  clearApiKey,
  getApiKey,
  getDatabaseLanguage,
  getFilterSettings,
  getHiddenAchievements,
  getMapFilterSettings,
  saveApiKey,
  saveDatabaseLanguage,
  saveFilterSettings,
  saveHiddenAchievements,
  saveMapFilterSettings,
} from '../utils/storage';

interface AppState {
  // Data State
  achievements: Achievement[];

  // Enriched Data (Single Source of Truth)
  enrichedGroups: EnrichedGroup[];
  enrichedGroupMap: Map<string, EnrichedGroup>;
  enrichedCategoryMap: Map<number, EnrichedCategory>;
  enrichedAchievementMap: Map<number, EnrichedAchievement>;

  accountProgress: Map<number, AccountAchievement>;
  groups: AchievementGroup[];
  categories: AchievementCategory[];

  // Mount Data
  unlockedMountTypes: string[];

  // Map Completion Data
  continentData: ContinentDatabase | null;
  mapLoading: boolean;
  mapBuildProgress: string | null;

  // UI State
  loading: boolean;
  buildingDatabase: boolean;
  loadingProgress: { current: number; total: number; } | null;
  error: string | null;
  databaseError: string | null;
  setupModalOpen: boolean;
  aboutModalOpen: boolean;
  isInitialized: boolean;

  // User Preferences
  apiKey: string | null;
  hasStoredKey: boolean;
  showCompletedAchievements: boolean;
  hiddenAchievements: Set<number>;
  showHidden: boolean;
  showCollectibleAchievements: boolean;
  hideCompletedZones: boolean;
  showRecommendedOnly: boolean;
  goalFilter: 'all' | 'required';
  databaseTimestamp: number | null;
  databaseLanguage: string;

  // Actions
  initialize: () => void;
  setSetupModalOpen: (open: boolean) => void;
  setAboutModalOpen: (open: boolean) => void;
  setShowCompletedAchievements: (show: boolean) => void;
  setShowHidden: (show: boolean) => void;
  setShowRecommendedOnly: (show: boolean) => void;
  setGoalFilter: (goal: 'all' | 'required') => void;
  setShowCollectibleAchievements: (show: boolean) => void;
  setHideCompletedZones: (hide: boolean) => void;
  initializeAchievementDatabase: () => Promise<void>;
  handleApiKeySubmit: (key: string, remember: boolean) => Promise<void>;
  handleClearKey: () => void;
  handleToggleHidden: (achievementId: number) => void;
  setDatabaseLanguage: (lang: string) => void;
  handleBuildDatabase: () => Promise<void>;
  refreshAccountProgress: () => Promise<void>;

  // Map Actions
  initializeContinentData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  achievements: [],
  categories: [],
  enrichedGroups: [],
  enrichedGroupMap: new Map(),
  enrichedCategoryMap: new Map(),
  enrichedAchievementMap: new Map(),
  accountProgress: new Map(),
  groups: [],
  unlockedMountTypes: [],
  continentData: null,
  mapLoading: false,
  mapBuildProgress: null,
  loading: false,
  buildingDatabase: false,
  loadingProgress: null,
  error: null,
  databaseError: null,
  setupModalOpen: false,
  aboutModalOpen: false,
  isInitialized: false,
  apiKey: null,
  hasStoredKey: false,
  showCompletedAchievements: false,
  hiddenAchievements: new Set(),
  showHidden: false,
  showCollectibleAchievements: false,
  hideCompletedZones: false,
  showRecommendedOnly: false,
  goalFilter: 'required',
  databaseTimestamp: null,
  databaseLanguage: getDatabaseLanguage(),

  // Actions
  initialize: async () => {
    const storedKey = getApiKey();
    const filterSettings = getFilterSettings();
    const mapFilterSettings = getMapFilterSettings();
    const hiddenIds = getHiddenAchievements();

    const { activeTs } = await getDatabaseStatus();

    set({
      databaseTimestamp: activeTs > 0 ? activeTs : null,
      hiddenAchievements: hiddenIds,
      showCompletedAchievements: filterSettings.showCompleted,
      showHidden: filterSettings.showHidden,
      showRecommendedOnly: filterSettings.showRecommendedOnly,
      goalFilter: filterSettings.goalFilter,
      showCollectibleAchievements: mapFilterSettings.showCollectibleAchievements,
      hideCompletedZones: mapFilterSettings.hideCompletedZones,
      isInitialized: true,
    });

    get()
      .initializeAchievementDatabase()
      .then(() => {
        if (storedKey) {
          set({
            hasStoredKey: true,
            apiKey: storedKey,
          });
          get().refreshAccountProgress();
        } else {
          set({ setupModalOpen: true });
        }
      });
  },

  setSetupModalOpen: (open) => set({ setupModalOpen: open }),
  setAboutModalOpen: (open) => set({ aboutModalOpen: open }),

  setDatabaseLanguage: (lang) => {
    saveDatabaseLanguage(lang);
    set({ databaseLanguage: lang });
  },

  setShowCompletedAchievements: (show) => {
    set({ showCompletedAchievements: show });
    const { isInitialized, showHidden, showRecommendedOnly, goalFilter } = get();
    if (isInitialized) {
      saveFilterSettings(show, showHidden, showRecommendedOnly, goalFilter);
    }
  },

  setShowHidden: (show) => {
    set({ showHidden: show });
    const { isInitialized, showCompletedAchievements, showRecommendedOnly, goalFilter } = get();
    if (isInitialized) {
      saveFilterSettings(showCompletedAchievements, show, showRecommendedOnly, goalFilter);
    }
  },

  setShowRecommendedOnly: (show) => {
    set({ showRecommendedOnly: show });
    const { isInitialized, showCompletedAchievements, showHidden, goalFilter } = get();
    if (isInitialized) {
      saveFilterSettings(showCompletedAchievements, showHidden, show, goalFilter);
    }
  },

  setGoalFilter: (goal) => {
    set({ goalFilter: goal });
    const { isInitialized, showCompletedAchievements, showHidden, showRecommendedOnly } = get();
    if (isInitialized) {
      saveFilterSettings(showCompletedAchievements, showHidden, showRecommendedOnly, goal);
    }
  },

  setShowCollectibleAchievements: (show) => {
    set({ showCollectibleAchievements: show });
    const { hideCompletedZones } = get();
    saveMapFilterSettings(show, hideCompletedZones);
  },

  setHideCompletedZones: (hide) => {
    set({ hideCompletedZones: hide });
    const { showCollectibleAchievements } = get();
    saveMapFilterSettings(showCollectibleAchievements, hide);
  },

  initializeAchievementDatabase: async () => {
    set({ loading: true, loadingProgress: null, error: null });

    try {
      // Fetch DB (legacy or v2)
      const db = await getDatabaseAchievements();

      let allAchievements: Achievement[] = [];
      let categories: AchievementCategory[] = [];

      if (db) {
        allAchievements = db.achievements;
        // If DB has categories, use them. Otherwise fetch them (migration path)
        if (db.categories && db.categories.length > 0) {
          categories = db.categories;
        } else {
          categories = await queryAchievementCategories({});
        }
      } else {
        // Should not happen if DB logic returns empty array on failure, but handling null
        categories = await queryAchievementCategories({});
      }

      // Build full hierarchy logic

      const {
        groups: eGroups,
        groupMap: eGroupMap,
        categoryMap: eCategoryMap,
        achievementMap: eAchievementMap,
      } = buildEnrichedHierarchy(
        allAchievements,
        categories,
        db?.groups || [],
        new Map() // No progress yet
      );

      set({
        achievements: allAchievements,
        categories: categories,
        groups: db?.groups || [],
        enrichedGroups: eGroups,
        enrichedGroupMap: eGroupMap,
        enrichedCategoryMap: eCategoryMap,
        enrichedAchievementMap: eAchievementMap,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements';
      set({ error: errorMessage });
      console.error('Error loading achievements:', err);
    } finally {
      set({ loading: false, loadingProgress: null });
    }
  },

  handleApiKeySubmit: async (key: string) => {
    set({ hasStoredKey: saveApiKey(key), apiKey: key });

    await get().refreshAccountProgress();
  },

  handleClearKey: () => {
    clearApiKey();
    set({
      hasStoredKey: false,
      apiKey: null,
      accountProgress: new Map(),
      unlockedMountTypes: [],
      error: null,
    });
  },

  handleToggleHidden: (achievementId: number) => {
    set((state) => {
      const newSet = new Set(state.hiddenAchievements);
      if (newSet.has(achievementId)) {
        newSet.delete(achievementId);
      } else {
        newSet.add(achievementId);
      }
      saveHiddenAchievements(newSet);
      return { hiddenAchievements: newSet };
    });
  },

  handleBuildDatabase: async () => {
    set({ buildingDatabase: true, loadingProgress: null, databaseError: null });

    try {
      // Build achievement database
      const { databaseLanguage } = get();
      const { db } = await buildAchievementDatabase((current, total) => {
        set({ loadingProgress: { current, total } });
      }, databaseLanguage);
      const { accountProgress } = get();

      const {
        groups: eGroups,
        groupMap: eGroupMap,
        categoryMap: eCategoryMap,
        achievementMap: eAchievementMap,
      } = buildEnrichedHierarchy(
        db.achievements,
        db.categories,
        db.groups,
        accountProgress
      );

      set({
        achievements: db.achievements,
        categories: db.categories,
        groups: db.groups,
        enrichedGroups: eGroups,
        enrichedGroupMap: eGroupMap,
        enrichedCategoryMap: eCategoryMap,
        enrichedAchievementMap: eAchievementMap,
        databaseTimestamp: db.timestamp,
      });

      // Also build continent/map database
      const continentDb = await buildContinentDatabase({ lang: databaseLanguage });
      set({ continentData: continentDb });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to build database';
      set({ databaseError: errorMessage });
      console.error('Error building database:', err);
    } finally {
      set({ buildingDatabase: false, loadingProgress: null });
    }
  },

  refreshAccountProgress: async () => {
    const { apiKey } = get();
    if (!apiKey) {
      console.warn('[Store] refreshAccountProgress called with no API key in state — skipping');
      return;
    }

    set({ loading: true, error: null });

    try {
      const [accountData, mountTypes] = await Promise.all([
        queryAccountAchievements(apiKey),
        (queryAccountMountTypes({ access_token: apiKey }) as Promise<string[]>).catch(() => [] as string[]),
      ]);

      // Create a map of account progress for quick lookup
      const progressMap = new Map<number, AccountAchievement>();
      accountData.forEach((progress) => {
        progressMap.set(progress.id, progress);
      });

      // Re-build hierarchy with new progress
      const { achievements, groups, categories } = get();

      const {
        groups: eGroups,
        groupMap: eGroupMap,
        categoryMap: eCategoryMap,
        achievementMap: eAchievementMap,
      } = buildEnrichedHierarchy(achievements, categories, groups, progressMap);

      set({
        accountProgress: progressMap,
        unlockedMountTypes: mountTypes,
        enrichedGroups: eGroups,
        enrichedGroupMap: eGroupMap,
        enrichedCategoryMap: eCategoryMap,
        enrichedAchievementMap: eAchievementMap,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh progress';
      set({ error: errorMessage });
      console.error('Error refreshing progress:', err);
    } finally {
      set({ loading: false });
    }
  },

  // Map Completion Actions
  initializeContinentData: async () => {
    set({ mapLoading: true });

    try {
      const data = await getContinentData();
      set({ continentData: data, mapLoading: false });
    } catch (err) {
      console.error('Error loading continent data:', err);
      set({ mapLoading: false });
    }
  },
}));
