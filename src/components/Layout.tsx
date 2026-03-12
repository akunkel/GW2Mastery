import { Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import AboutModal from './AboutModal';
import Header from './common/Header';
import Navigation from './common/Navigation';
import SetupModal from './SetupModal';

export default function Layout() {
    const { refreshAccountProgress, loading } = useAppStore();

    return (
        <div className="h-dvh flex flex-col overflow-hidden">
            {/* Header - h-12 (3rem) */}
            <Header
                onRefresh={() => refreshAccountProgress()}
                loading={loading}
            />

            {/* Navigation - Mobile only, approx h-12 */}
            <Navigation />

            {/* Modals */}
            <SetupModal />
            <AboutModal />

            {/* Page Content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="max-w-[1800px] mx-auto w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
