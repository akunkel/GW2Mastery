import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import MasteryPage from './pages/mastery/MasteryPage';
import ExplorationPage from './pages/exploration/ExplorationPage';
import GuidesPage from './pages/guides/GuidesPage';
import { useAppStore } from './store/useAppStore';

function App() {
    const { initialize } = useAppStore();

    // Check for stored API key, database, and filter settings on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<MasteryPage />} />
                    <Route path="exploration" element={<ExplorationPage />} />
                    <Route path="guides" element={<GuidesPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
