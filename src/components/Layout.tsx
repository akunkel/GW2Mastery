import { Settings } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import SetupModal from './SetupModal';
import { Button } from './ui/button';
import { useAppStore } from '../store/useAppStore';

export default function Layout() {
    const { setSetupModalOpen } = useAppStore();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-10 relative">
            {/* Setup Button - Absolute Top Left */}
            <Button
                onClick={() => setSetupModalOpen(true)}
                variant="outline"
                size="sm"
                className="absolute top-4 left-4 z-10 mt-0 ml-0"
            >
                <Settings className="w-4 h-4" />
                Setup
            </Button>

            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <header className="text-center mb-10 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                        GW2Mastery
                    </h1>
                    <p className="text-slate-400 lg:text-lg md:text-base text-sm">
                        Just the mastery points, please.
                    </p>
                </header>

                {/* Setup Modal */}
                <SetupModal />

                {/* Page Content */}
                <Outlet />
            </div>
        </div>
    );
}
