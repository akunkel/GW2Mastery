import { useEffect, useRef, useState } from 'react';
import DatabaseSection from './DatabaseSection';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface SetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySubmit: (key: string, remember: boolean) => void;
  onClearKey: () => void;
  onBuildDatabase: () => Promise<void>;
  isLoading: boolean;
  buildingDatabase: boolean;
  error: string | null;
  databaseError: string | null;
  hasStoredKey: boolean;
  storedApiKey: string | null;
  databaseTimestamp: number | null;
  loadingProgress: { current: number; total: number } | null;
  hasAchievements: boolean;
}

export default function SetupModal({
  open,
  onOpenChange,
  onApiKeySubmit,
  onClearKey,
  onBuildDatabase,
  isLoading,
  buildingDatabase,
  error,
  databaseError,
  hasStoredKey,
  storedApiKey,
  databaseTimestamp,
  loadingProgress,
  hasAchievements,
}: SetupModalProps) {
  const [localApiKey, setLocalApiKey] = useState<string>('');
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const wasLoadingRef = useRef<boolean>(false);

  // Sync local state with stored key when it changes
  useEffect(() => {
    setLocalApiKey(storedApiKey || '');
  }, [storedApiKey]);

  const apiKey = localApiKey;

  // Show input as enabled if there's an error (allows retry)
  const shouldShowClearButton = hasStoredKey && !error && !isLoading && !justSubmitted;
  const shouldDisableInput = isLoading || shouldShowClearButton;

  // Track loading state changes
  useEffect(() => {
    if (isLoading) {
      wasLoadingRef.current = true;
    }
  }, [isLoading]);

  // Close modal after successful API key submission and loading completes
  useEffect(() => {
    // Only close if we just submitted, were loading, and now loading is done successfully
    if (
      justSubmitted &&
      wasLoadingRef.current &&
      !isLoading &&
      !error &&
      open
    ) {
      onOpenChange(false);
      setJustSubmitted(false);
      wasLoadingRef.current = false;
    }
  }, [justSubmitted, isLoading, error, open, onOpenChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      setJustSubmitted(true);
      onApiKeySubmit(apiKey.trim(), true); // Always remember the API key
      // Don't clear the API key - it will be managed by the useEffect
    }
  };

  const handleClearKey = () => {
    setJustSubmitted(false);
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
                <p className="text-sm text-red-400 font-medium mb-2">✗ {error}</p>
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
