import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { TooltipProvider } from './components/ui/Tooltip';
import DebugPage from './pages/debug/DebugPage';
import MapPage from './pages/map/MapPage';
import MasteryPage from './pages/mastery/MasteryPage';
import MountsPage from './pages/mounts/MountsPage';
import ToysPage from './pages/toys/ToysPage';
import { useAppStore } from './store/useAppStore';

function App() {
    const { initialize } = useAppStore();

    // Check for stored API key, database, and filter settings on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <TooltipProvider delayDuration={300}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<MasteryPage />} />
                        <Route path="mounts" element={<MountsPage />} />
                        <Route path="toys" element={<ToysPage />} />
                        <Route path="map" element={<MapPage />} />
                        <Route path="debug" element={<DebugPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    );
}

export default App;
