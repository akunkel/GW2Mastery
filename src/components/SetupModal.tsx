import { useEffect, useRef, useState } from 'react';
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
  hasStoredKey,
  storedApiKey,
  databaseTimestamp,
  loadingProgress,
  hasAchievements,
}: SetupModalProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const wasLoadingRef = useRef<boolean>(false);

  // Prefill API key when stored key exists
  useEffect(() => {
    if (hasStoredKey && storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setApiKey('');
    }
  }, [hasStoredKey, storedApiKey]);

  // Track loading state changes
  useEffect(() => {
    if (isLoading) {
      wasLoadingRef.current = true;
    }
  }, [isLoading]);

  // Close modal after successful API key submission and loading completes
  useEffect(() => {
    // Only close if we just submitted, were loading, and now loading is done
    if (
      justSubmitted &&
      wasLoadingRef.current &&
      !isLoading &&
      !error &&
      open
    ) {
      // Small delay to allow user to see the success state
      const timer = setTimeout(() => {
        onOpenChange(false);
        setJustSubmitted(false);
        wasLoadingRef.current = false;
      }, 500);
      return () => clearTimeout(timer);
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

  const handleBuildDatabase = async () => {
    await onBuildDatabase();
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
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || hasStoredKey || justSubmitted}
                  />
                  {(hasStoredKey || justSubmitted) && (
                    <button
                      type="button"
                      onClick={onClearKey}
                      className="px-3 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-lg whitespace-nowrap"
                      disabled={isLoading}
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </div>
              )}

              {!hasStoredKey && (
                <div className="relative group">
                  <button
                    type="submit"
                    disabled={isLoading || !apiKey.trim()}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {isLoading ? 'Loading...' : 'Load Achievements'}
                  </button>
                  {!isLoading && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-slate-700">
                      Please build the achievement database first.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700/50" />

          {/* Database Section */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-1">
              <div className="flex-1">
                <h3 className="text-white font-medium">Achievement Database</h3>
                {databaseTimestamp ? (
                  <p className="text-sm text-green-400 font-medium">
                    ✓ Last built{' '}
                    {new Date(databaseTimestamp).toLocaleDateString()}
                  </p>
                ) : (
                  <p className="text-sm text-amber-400 font-medium">
                    ⚠️ Database not built, click "Build Database" to start.
                  </p>
                )}
              </div>
              <button
                onClick={handleBuildDatabase}
                disabled={buildingDatabase}
                className="px-3 py-1 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:shadow-none whitespace-nowrap bg-slate-700 hover:bg-slate-600"
              >
                {buildingDatabase ? 'Rebuilding...' : 'Rebuild Database'}
              </button>
            </div>
            {buildingDatabase && loadingProgress && (
              <p className="text-xs text-blue-400 font-medium mb-1">
                Building database ({loadingProgress.current} of{' '}
                {loadingProgress.total} batches)...
              </p>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              If these achievements are stale, click "Rebuild Database" for the
              newest data from the server.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
