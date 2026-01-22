import { Outlet } from 'react-router-dom';
import Header from './common/Header';
import Navigation from './common/Navigation';
import SetupModal from './SetupModal';
import { useAppStore } from '../store/useAppStore';

export default function Layout() {
    const { setSetupModalOpen, refreshAccountProgress, loading, handleBuildContinentDatabase } = useAppStore();

    return (
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
            {/* Header - h-12 (3rem) */}
            <Header
                onRefresh={() => refreshAccountProgress()}
                onSetup={() => setSetupModalOpen(true)}
                loading={loading}
                onBuildMap={() => handleBuildContinentDatabase()}
            />

            {/* Navigation - Mobile only, approx h-12 */}
            <Navigation />

            {/* Setup Modal */}
            <SetupModal />

            {/* Page Content */}
            <div className="max-w-[1800px] mx-auto w-full">
                <Outlet />
            </div>
        </div>
    );
}
