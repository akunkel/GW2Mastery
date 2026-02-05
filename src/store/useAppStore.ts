import { create } from 'zustand';
import {
    buildAchievementDatabase,
    fetchAccountAchievements,
    fetchAchievementCategories,
    getDatabaseStatus,
    getDbAchievements,
    buildContinentDatabase,
    getContinentData,
} from '../services/gw2Api';
import type {
    AccountAchievement,
    Achievement,
    AchievementCategory,
    AchievementGroup,
    EnrichedAchievement,
    EnrichedCategory,
    EnrichedGroup,
    FilterType,
    GoalType,
    ContinentDatabase,
} from '../types/gw2';
import {
    clearApiKey,
    getApiKey,
    getFilterSettings,
    getHiddenAchievements,
    getMapFilterSettings,
    saveApiKey,
    saveFilterSettings,
    saveHiddenAchievements,
    saveMapFilterSettings,
} from '../utils/storage';
import { buildEnrichedHierarchy } from '../utils/filters';

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

    // Map Completion Data
    continentData: ContinentDatabase | null;
    mapLoading: boolean;
    mapBuildProgress: string | null;

    // UI State
    loading: boolean;
    buildingDatabase: boolean;
    loadingProgress: { current: number; total: number } | null;
    error: string | null;
    databaseError: string | null;
    setupModalOpen: boolean;
    isInitialized: boolean;

    // User Preferences
    apiKey: string | null;
    hasStoredKey: boolean;
    filter: FilterType;
    goal: GoalType;
    hiddenAchievements: Set<number>;
    showHidden: boolean;
    showCollectibleAchievements: boolean;
    databaseTimestamp: number | null;

    // Actions
    initialize: () => void;
    setSetupModalOpen: (open: boolean) => void;
    setFilter: (filter: FilterType) => void;
    setGoal: (goal: GoalType) => void;
    setShowHidden: (show: boolean) => void;
    setShowCollectibleAchievements: (show: boolean) => void;
    initializeAchievementDatabase: () => Promise<void>;
    handleApiKeySubmit: (key: string, remember: boolean) => Promise<void>;
    handleClearKey: () => void;
    handleToggleHidden: (achievementId: number) => void;
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
    continentData: null,
    mapLoading: false,
    mapBuildProgress: null,
    loading: false,
    buildingDatabase: false,
    loadingProgress: null,
    error: null,
    databaseError: null,
    setupModalOpen: false,
    isInitialized: false,
    apiKey: null,
    hasStoredKey: false,
    filter: 'all',
    goal: 'all',
    hiddenAchievements: new Set(),
    showHidden: false,
    showCollectibleAchievements: false,
    databaseTimestamp: null,

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
            filter: filterSettings.hideCompleted ? 'incomplete' : 'all',
            goal: filterSettings.requiredOnly ? 'required' : 'all',
            showHidden: filterSettings.showHidden,
            showCollectibleAchievements: mapFilterSettings.showCollectibleAchievements,
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

    setFilter: (filter) => {
        set({ filter });
        const { isInitialized, goal } = get();
        if (isInitialized) {
            const hideCompleted = filter === 'incomplete';
            const requiredOnly = goal === 'required';
            const { showHidden } = get();
            saveFilterSettings(hideCompleted, requiredOnly, showHidden);
        }
    },

    setGoal: (goal) => {
        set({ goal });
        const { isInitialized, filter } = get();
        if (isInitialized) {
            const hideCompleted = filter === 'incomplete';
            const requiredOnly = goal === 'required';
            const { showHidden } = get();
            saveFilterSettings(hideCompleted, requiredOnly, showHidden);
        }
    },

    setShowHidden: (show) => {
        set({ showHidden: show });
        const { isInitialized, filter, goal } = get();
        if (isInitialized) {
            const hideCompleted = filter === 'incomplete';
            const requiredOnly = goal === 'required';
            saveFilterSettings(hideCompleted, requiredOnly, show);
        }
    },

    setShowCollectibleAchievements: (show) => {
        set({ showCollectibleAchievements: show });
        saveMapFilterSettings(show);
    },

    initializeAchievementDatabase: async () => {
        set({ loading: true, loadingProgress: null, error: null });

        try {
            // Fetch DB (legacy or v2)
            const db = await getDbAchievements();

            let allAchievements: Achievement[] = [];
            let categories: AchievementCategory[] = [];

            if (db) {
                allAchievements = db.achievements;
                // If DB has categories, use them. Otherwise fetch them (migration path)
                if (db.categories && db.categories.length > 0) {
                    categories = db.categories;
                } else {
                    categories = await fetchAchievementCategories();
                }
            } else {
                // Should not happen if DB logic returns empty array on failure, but handling null
                categories = await fetchAchievementCategories();
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

    handleApiKeySubmit: async (key: string, remember: boolean) => {
        if (remember) {
            saveApiKey(key);
            set({ hasStoredKey: true, apiKey: key });
        } else {
            clearApiKey();
            set({ hasStoredKey: false, apiKey: null });
        }

        await get().refreshAccountProgress();
    },

    handleClearKey: () => {
        clearApiKey();
        set({
            hasStoredKey: false,
            apiKey: null,
            accountProgress: new Map(),
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
            const db = await buildAchievementDatabase((current, total) => {
                set({ loadingProgress: { current, total } });
            });
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
            const continentDb = await buildContinentDatabase();
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
        if (!apiKey) return;

        set({ loading: true, error: null });

        try {
            const accountData = await fetchAccountAchievements(apiKey);

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
