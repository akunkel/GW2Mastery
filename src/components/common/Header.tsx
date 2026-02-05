import { RefreshCw, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import NavTabs from './NavTabs';

interface HeaderProps {
    onRefresh: () => void;
    onSetup: () => void;
    loading?: boolean;
}

export default function Header({ onRefresh, onSetup, loading }: HeaderProps) {
    return (
        <header className="w-full bg-slate-900 border-b border-slate-800 px-4 py-0 sm:px-6 lg:px-8 shadow-md h-12 flex items-center gap-4 sticky top-0 z-50">
            <div className="max-w-[1800px] w-full mx-auto flex items-center justify-between h-full">
                {/* Left: Refresh Button */}
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
                        <span className="hidden sm:inline">Refresh</span>
                    </Button>
                </div>

                {/* Center: Tabs (Desktop Only) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 h-full">
                    <NavTabs className="gap-8 h-full" itemClassName="px-2 h-full" />
                </div>

                {/* Right: Setup Button */}
                <div className="flex-shrink-0">
                    <Button
                        onClick={onSetup}
                        disabled={loading}
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800 gap-2"
                        title="Open Setup"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Setup</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
