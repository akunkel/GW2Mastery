import React, { useState } from 'react';

interface ApiKeyFormProps {
    initialKey: string | null;
    loading: boolean;
    error: string | null;
    hasStoredKey: boolean;
    onApiKeySubmit: (key: string) => Promise<void>;
    onClearKey: () => void;
    onBrowseMode: () => void;
}

export default function ApiKeyForm({
    initialKey,
    loading,
    error,
    hasStoredKey,
    onApiKeySubmit,
    onClearKey,
    onBrowseMode,
}: ApiKeyFormProps) {
    const [apiKey, setApiKey] = useState(initialKey || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (apiKey.trim()) {
            await onApiKeySubmit(apiKey.trim());
        }
    };

    const handleClear = () => {
        setApiKey('');
        onClearKey();
    };

    // Show input as enabled if there's an error (allows retry)
    const shouldShowClearButton = hasStoredKey && !error && !loading;
    const shouldDisableInput = loading || shouldShowClearButton;

    return (
        <div>
            <h3 className="text-white font-semibold mb-2">Guild Wars 2 API Key</h3>

            <form onSubmit={handleSubmit}>
                <div>
                    <p className="mb-3 text-xs text-slate-400 leading-relaxed">
                        Tracking achievement completion requires an API key. Generate one at{' '}
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
                            disabled={shouldDisableInput}
                        />
                        {shouldShowClearButton && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-3 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-lg whitespace-nowrap"
                                disabled={loading}
                            >
                                Clear Key
                            </button>
                        )}
                    </div>
                </div>

                {error && <p className="text-sm text-red-400 font-medium mb-2">✗ {error}</p>}

                {!shouldShowClearButton && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <button
                                type="submit"
                                disabled={loading || !apiKey.trim()}
                                className="w-full px-4 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none"
                            >
                                {loading ? 'Loading…' : 'Set API Key'}
                            </button>
                        </div>

                        <div className="relative group">
                            <button
                                type="button"
                                onClick={onBrowseMode}
                                disabled={loading}
                                className="w-full px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-all duration-200 hover:text-white border border-slate-700"
                            >
                                No Thanks
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
