import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SetupSectionProps {
  onApiKeySubmit: (key: string, remember: boolean) => void;
  onClearKey: () => void;
  onBuildDatabase: () => Promise<void>;
  isLoading: boolean;
  buildingDatabase: boolean;
  error: string | null;
  hasStoredKey: boolean;
  hasMasteryDatabase: boolean;
  databaseTimestamp: number | null;
  loadingProgress: { current: number; total: number } | null;
  hasAchievements: boolean;
}

export default function SetupSection({
  onApiKeySubmit,
  onClearKey,
  onBuildDatabase,
  isLoading,
  buildingDatabase,
  error,
  hasStoredKey,
  hasMasteryDatabase,
  databaseTimestamp,
  loadingProgress,
  hasAchievements,
}: SetupSectionProps) {
  const [apiKey, setApiKey] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Auto-collapse when achievements are loaded
  useEffect(() => {
    if (hasAchievements) {
      setIsCollapsed(true);
    }
  }, [hasAchievements]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim(), remember);
    }
  };

  const handleBuildDatabase = async () => {
    await onBuildDatabase();
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="bg-slate-800/80 backdrop-blur rounded-xl shadow-xl border border-slate-700/50">
        {/* Header - always visible */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between p-5 transition-all duration-200 hover:bg-slate-700/30 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Setup</h2>
            {hasStoredKey && hasMasteryDatabase && (
              <span className="text-green-400 text-sm font-medium">✓ Ready</span>
            )}
          </div>
          {isCollapsed ? (
            <ChevronDown className="w-6 h-6 text-slate-400" />
          ) : (
            <ChevronUp className="w-6 h-6 text-slate-400" />
          )}
        </button>

        {/* Collapsible content */}
        {!isCollapsed && (
          <div className="px-5 pb-5 space-y-6">
            {/* Database Section */}
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1.5">Mastery Achievement Database</h3>
                  {hasMasteryDatabase && databaseTimestamp ? (
                    <p className="text-sm text-green-400 font-medium">
                      ✓ Built on {new Date(databaseTimestamp).toLocaleDateString()} at{' '}
                      {new Date(databaseTimestamp).toLocaleTimeString()}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-400 font-medium">
                      ⚠️ Database not built. Click the button to build it.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleBuildDatabase}
                  disabled={buildingDatabase}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg disabled:shadow-none whitespace-nowrap"
                >
                  {buildingDatabase ? 'Building...' : hasMasteryDatabase ? 'Rebuild Database' : 'Build Database'}
                </button>
              </div>
              {buildingDatabase && loadingProgress && (
                <p className="text-xs text-blue-400 font-medium">
                  Building database ({loadingProgress.current} of {loadingProgress.total} batches)...
                </p>
              )}
              {!hasMasteryDatabase && (
                <p className="text-xs text-slate-400 leading-relaxed">
                  The database indexes all mastery point achievements (~8000 achievements).
                  This only needs to be done once and is saved in your browser.
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-700/50" />

            {/* API Key Section */}
            <div>
              <h3 className="text-white font-semibold mb-3">Guild Wars 2 API Key</h3>

              {hasStoredKey && (
                <div className="mb-4 p-4 bg-green-900/30 border border-green-700/50 rounded-lg flex items-center justify-between">
                  <span className="text-green-400 text-sm font-medium">✓ API key loaded from storage</span>
                  <button
                    onClick={onClearKey}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg"
                  >
                    Clear Key
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your GW2 API key"
                    className="w-full px-5 py-3.5 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    disabled={isLoading}
                  />
                  <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">
                    Generate an API key at{' '}
                    <a
                      href="https://account.arena.net/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      account.arena.net/applications
                    </a>
                    {' '}(requires "account" and "progression" permissions)
                  </p>
                </div>

                <div className="flex items-center space-x-2.5">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <label htmlFor="remember" className="text-sm text-slate-300">
                    Remember API key (stored locally in browser)
                  </label>
                </div>

                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-700/50 rounded-lg">
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !apiKey.trim()}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {isLoading ? 'Loading...' : 'Load Achievements'}
                </button>
              </form>

              <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                <p className="text-xs text-amber-400 leading-relaxed">
                  ⚠️ Your API key is stored locally in your browser and never sent to any third-party servers.
                  Never share your API key with anyone.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
