import { Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import Header from './common/Header';
import Navigation from './common/Navigation';
import SetupModal from './SetupModal';

export default function Layout() {
    const { setSetupModalOpen, refreshAccountProgress, loading } = useAppStore();

    return (
        <div className="relative overflow-hidden">
            {/* Header - h-12 (3rem) */}
            <Header
                onRefresh={() => refreshAccountProgress()}
                onSetup={() => setSetupModalOpen(true)}
                loading={loading}
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
