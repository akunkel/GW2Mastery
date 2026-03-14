import { LANG_OPTIONS } from '../services/endpointTypes';

interface DatabaseSectionProps {
    databaseTimestamp: number | null;
    buildingDatabase: boolean;
    onBuildDatabase: () => Promise<void>;
    loadingProgress: { current: number; total: number } | null;
    error: string | null;
    databaseLanguage: string;
    onDatabaseLanguageChange: (lang: string) => void;
}

export default function DatabaseSection({
    databaseTimestamp,
    buildingDatabase,
    onBuildDatabase,
    loadingProgress,
    error,
    databaseLanguage,
    onDatabaseLanguageChange,
}: DatabaseSectionProps) {
    const handleBuildDatabase = async () => {
        await onBuildDatabase();
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-1">
                <div className="flex-1">
                    <h3 className="text-white font-medium">Achievement Database</h3>
                    {error && <p className="text-sm text-red-400 font-medium mb-1">✗ {error}</p>}
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
                            {!loadingProgress && (
                                <p className="text-sm text-blue-400 font-medium mb-1">
                                    Building database…
                                </p>
                            )}
                            {loadingProgress && (
                                <p className="text-sm text-blue-400 font-medium mb-1">
                                    Building database ({loadingProgress.current} of{' '}
                                    {loadingProgress.total} batches)…
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
                Rebuilding the database re-downloads all achievements in the game, which will take a
                while. You likely don't need to do this unless new achievements have been added
                since the last time this app was updated, or you want to change the language.
            </p>
            <div className="flex items-center gap-2 mt-3">
                <button
                    onClick={handleBuildDatabase}
                    disabled={buildingDatabase}
                    className="px-3 py-1 disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:shadow-none whitespace-nowrap bg-slate-700 hover:bg-slate-600"
                >
                    {buildingDatabase ? 'Rebuilding…' : 'Rebuild Database'}
                </button>
                <select
                    value={databaseLanguage}
                    onChange={(e) => onDatabaseLanguageChange(e.target.value)}
                    disabled={buildingDatabase}
                    className="px-2 py-0.5 bg-slate-700 text-white text-xs rounded border border-slate-600 disabled:cursor-not-allowed"
                >
                    {LANG_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
