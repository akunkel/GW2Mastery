import { Outlet } from 'react-router-dom';
import Header from './common/Header';
import Navigation from './common/Navigation';
import SetupModal from './SetupModal';
import { useAppStore } from '../store/useAppStore';

export default function Layout() {
    const { setSetupModalOpen, refreshAccountProgress, loading } = useAppStore();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 relative">

            <Header
                onRefresh={() => refreshAccountProgress()}
                onSetup={() => setSetupModalOpen(true)}
                loading={loading}
            />

            {/* <Navigation /> */}

            <div className="max-w-[1800px] mx-auto">
                {/* Subtitle / context if needed, or just let the page handle it */}
                <div className="text-center mb-8 mt-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
                        GW2Mastery
                    </h1>
                    <p className="text-slate-400 lg:text-lg md:text-base text-sm">
                        Just the mastery points, please.
                    </p>
                </div>

                {/* Setup Modal */}
                <SetupModal />

                {/* Page Content */}
                <Outlet />
            </div>
        </div>
    );
}
