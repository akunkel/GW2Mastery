import { Bug, Info, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { SHOW_DEBUG } from '../../utils/environment';
import { Button } from '../ui/Button';
import NavTabs from './NavTabs';

interface HeaderProps {
    onRefresh: () => void;
    loading?: boolean;
}

export default function Header({ onRefresh, loading }: HeaderProps) {
    const navigate = useNavigate();
    const hasStoredKey = useAppStore((s) => s.hasStoredKey);
    const setSetupModalOpen = useAppStore((s) => s.setSetupModalOpen);
    const setAboutModalOpen = useAppStore((s) => s.setAboutModalOpen);

    return (
        <header className="w-full bg-slate-900 border-b border-slate-800 px-2 py-0 shadow-md h-12 flex items-center gap-4 sticky top-0 z-50">
            <div className="max-w-[1800px] w-full mx-auto flex items-center justify-between h-full">
                {/* Left: Refresh + About Buttons */}
                <div className="flex-shrink-0 flex gap-2">
                    <Button
                        onClick={onRefresh}
                        disabled={loading}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
                        title="Refresh Account Progress"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden lg:inline">Refresh</span>
                    </Button>
                    <Button
                        onClick={() => setAboutModalOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
                        title="About"
                    >
                        <Info className="w-4 h-4" />
                        <span className="hidden lg:inline">About</span>
                    </Button>
                </div>

                {/* Center: Tabs (Desktop Only) */}
                <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 h-full">
                    <NavTabs className="gap-8 h-full" itemClassName="px-2 h-full" />
                </div>

                {/* Right: Debug + Setup Buttons */}
                <div className="flex-shrink-0 flex gap-2">
                    {SHOW_DEBUG && (
                        <Button
                            onClick={() => navigate('/debug')}
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
                            title="Debug"
                        >
                            <Bug className="w-4 h-4" />
                            <span className="hidden lg:inline">Debug</span>
                        </Button>
                    )}
                    <Button
                        onClick={() => setSetupModalOpen(true)}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
                        title="Setup"
                    >
                        <span className="relative">
                            <Settings className="w-4 h-4" />
                            {!hasStoredKey && (
                                <>
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full" />
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                                </>
                            )}
                        </span>
                        <span className="hidden lg:inline">Setup</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
