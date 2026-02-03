import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { TooltipProvider } from './components/ui/tooltip';
import GuidesPage from './pages/guides/GuidesPage';
import MapCompletionPage from './pages/map-completion/MapCompletionPage';
import MasteryPage from './pages/mastery/MasteryPage';
import { useAppStore } from './store/useAppStore';

function App() {
    const { initialize } = useAppStore();

    // Check for stored API key, database, and filter settings on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <TooltipProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<MasteryPage />} />
                        <Route path="map-completion" element={<MapCompletionPage />} />
                        <Route path="guides" element={<GuidesPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    );
}

export default App;
