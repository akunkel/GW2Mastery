import { create } from 'zustand';
import {
    buildAchievementDatabase,
    fetchAccountAchievements,
    fetchAchievementCategories,
    getDatabaseStatus,
    getDbAchievements,
    mapAchievementsToCategories,
    validateApiKey,
} from '../services/gw2Api';
import type {
    AccountAchievement,
    Achievement,
    AchievementCategory,
    FilterType,
    GoalType,
} from '../types/gw2';
import {
    clearApiKey,
    getApiKey,
    getFilterSettings,
    getHiddenAchievements,
    saveApiKey,
    saveFilterSettings,
    saveHiddenAchievements,
} from '../utils/storage';

interface AppState {
    // Data State
    achievements: Achievement[];
    accountProgress: Map<number, AccountAchievement>;
    categoryMap: Map<
        number,
        { categoryId: number; categoryName: string; categoryOrder: number }
    >;

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
    databaseTimestamp: number | null;

    // Actions
    initialize: () => void;
    setSetupModalOpen: (open: boolean) => void;
    setFilter: (filter: FilterType) => void;
    setGoal: (goal: GoalType) => void;
    setShowHidden: (show: boolean) => void;
    loadAchievements: (key: string) => Promise<void>;
    handleApiKeySubmit: (key: string, remember: boolean) => Promise<void>;
    handleClearKey: () => void;
    handleToggleHidden: (achievementId: number) => void;
    handleBuildDatabase: () => Promise<void>;
    refreshAccountProgress: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Initial State
    achievements: [],
    accountProgress: new Map(),
    categoryMap: new Map(),
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
    databaseTimestamp: null,

    // Actions
    initialize: () => {
        const storedKey = getApiKey();
        const filterSettings = getFilterSettings();
        const hiddenIds = getHiddenAchievements();

        const { activeTs } = getDatabaseStatus();

        set({
            databaseTimestamp: activeTs > 0 ? activeTs : null,
            hiddenAchievements: hiddenIds,
            filter: filterSettings.hideCompleted ? 'incomplete' : 'all',
            goal: filterSettings.requiredOnly ? 'required' : 'all',
            showHidden: filterSettings.showHidden,
            isInitialized: true,
        });

        if (storedKey) {
            set({
                hasStoredKey: true,
                apiKey: storedKey
            });

            get().loadAchievements(storedKey);
        } else {
            set({ setupModalOpen: true });
        }
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

    loadAchievements: async (key: string) => {
        set({ loading: true, loadingProgress: null, error: null });

        try {
            // Validate API key
            const isValid = await validateApiKey(key);
            if (!isValid) {
                throw new Error('Invalid API key or insufficient permissions');
            }

            // Fetch account progress first (this is fast)
            const accountData = await fetchAccountAchievements(key);

            // Create a map of account progress for quick lookup
            const progressMap = new Map<number, AccountAchievement>();
            accountData.forEach((progress) => {
                progressMap.set(progress.id, progress);
            });

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

            // Map achievements to their categories
            const achCategoryMap = mapAchievementsToCategories(
                allAchievements,
                categories
            );

            set({
                achievements: allAchievements,
                accountProgress: progressMap,
                categoryMap: achCategoryMap,
            });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to load achievements';
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

        await get().loadAchievements(key);
    },

    handleClearKey: () => {
        clearApiKey();
        set({
            hasStoredKey: false,
            apiKey: null,
            achievements: [],
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
            await buildAchievementDatabase((current, total) => {
                set({ loadingProgress: { current, total } });
            });
            // Timestamp is no longer relevant for static data build output
            set({ databaseTimestamp: Date.now() });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to build database';
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

            set({ accountProgress: progressMap });
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to refresh progress';
            set({ error: errorMessage });
            console.error('Error refreshing progress:', err);
        } finally {
            set({ loading: false });
        }
    },
}));
