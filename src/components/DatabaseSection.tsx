interface DatabaseSectionProps {
  databaseTimestamp: number | null;
  buildingDatabase: boolean;
  onBuildDatabase: () => Promise<void>;
  loadingProgress: { current: number; total: number } | null;
  error: string | null;
}

export default function DatabaseSection({
  databaseTimestamp,
  buildingDatabase,
  onBuildDatabase,
  loadingProgress,
  error,
}: DatabaseSectionProps) {
  const handleBuildDatabase = async () => {
    await onBuildDatabase();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-1">
        <div className="flex-1">
          <h3 className="text-white font-medium">Achievement Database</h3>
          {error && (
            <p className="text-sm text-red-400 font-medium mb-1">✗ {error}</p>
          )}
          {!error && databaseTimestamp && !buildingDatabase && (
            <p className="text-sm text-green-400 font-medium mb-1">
              ✓ Last built {new Date(databaseTimestamp).toLocaleDateString()}
            </p>
          )}
          {!error && !databaseTimestamp && (
            <p className="text-sm text-amber-400 font-medium mb-1">
              ⚠️ Database not built, click "Build Database" to start.
            </p>
          )}
          {buildingDatabase && (
            <>
              {!loadingProgress && <p className="text-sm text-blue-400 font-medium mb-1">
                Building database…
              </p>}
              {loadingProgress && <p className="text-sm text-blue-400 font-medium mb-1">
                Building database ({loadingProgress.current} of{' '}
                {loadingProgress.total} batches)…
              </p>}
            </>
          )}
        </div>
        <button
          onClick={handleBuildDatabase}
          disabled={buildingDatabase}
          className="px-3 py-1 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:shadow-none whitespace-nowrap bg-slate-700 hover:bg-slate-600"
        >
          {buildingDatabase ? 'Rebuilding…' : 'Rebuild Database'}
        </button>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        If these achievements are stale, click "Rebuild Database" to download them from the server (this may take a while).
      </p>
    </div>
  );
}
