import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import DatabaseSection from './DatabaseSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

export default function SetupModal() {
  const {
    setupModalOpen: open,
    setSetupModalOpen: onOpenChange,
    handleApiKeySubmit: onApiKeySubmit,
    handleClearKey: onClearKey,
    handleBuildDatabase: onBuildDatabase,
    loading: isLoading,
    buildingDatabase,
    error,
    databaseError,
    hasStoredKey,
    apiKey: storedApiKey,
    databaseTimestamp,
    loadingProgress,
    achievements,
  } = useAppStore();

  const hasAchievements = achievements.length > 0;

  const [localApiKey, setLocalApiKey] = useState<string>('');


  // Sync local state with stored key when it changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setLocalApiKey(storedApiKey || '');
  }, [storedApiKey]);

  const apiKey = localApiKey;

  // Show input as enabled if there's an error (allows retry)
  const shouldShowClearButton =
    hasStoredKey && !error && !isLoading;
  const shouldDisableInput = isLoading || shouldShowClearButton;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      await onApiKeySubmit(apiKey.trim(), true);
      // Check for error in the store state after await
      const currentError = useAppStore.getState().error;
      if (!currentError) {
        onOpenChange(false);
      }
    }
  };

  const handleClearKey = () => {

    setLocalApiKey('');
    onClearKey();
  };

  // Prevent closing if achievements aren't loaded
  const handleOpenChange = (newOpen: boolean) => {
    // Only allow closing if achievements are loaded
    if (!newOpen && !hasAchievements) {
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        hideClose={!hasAchievements}
      >
        <DialogHeader>
          <DialogTitle>Setup</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* API Key Section */}
          <div>
            <h3 className="text-white font-semibold mb-2">
              Guild Wars 2 API Key
            </h3>

            <form onSubmit={handleSubmit}>
              <div>
                <p className="mb-3 text-xs text-slate-400 leading-relaxed">
                  Generate an API key at{' '}
                  <a
                    href="https://account.arena.net/applications"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    account.arena.net/applications
                  </a>{' '}
                  (requires "account" and "progression" permissions)
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={shouldDisableInput}
                  />
                  {shouldShowClearButton && (
                    <button
                      type="button"
                      onClick={handleClearKey}
                      className="px-3 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-lg whitespace-nowrap"
                      disabled={isLoading}
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-400 font-medium mb-2">
                  ✗ {error}
                </p>
              )}

              {!shouldShowClearButton && (
                <div className="relative group">
                  <button
                    type="submit"
                    disabled={isLoading || !apiKey.trim()}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {isLoading ? 'Loading…' : 'Load Achievements'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/50" />

          {/* Database Section */}
          <DatabaseSection
            databaseTimestamp={databaseTimestamp}
            buildingDatabase={buildingDatabase}
            onBuildDatabase={onBuildDatabase}
            loadingProgress={loadingProgress}
            error={databaseError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

