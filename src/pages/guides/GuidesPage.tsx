import { useState } from 'react';
import { ChevronDown, ChevronRight, Swords, Skull, Crown, Ghost } from 'lucide-react';
import {
    FRACTALS,
    RAIDS,
    STRIKES,
    DUNGEONS,
    type GuideItem,
    type GuideCategory,
} from '../../data/guidesData';

// Helper component for section headers (Top Level)
const SectionHeader = ({
    title,
    icon: Icon,
    isOpen,
    onClick,
}: {
    title: string;
    icon: React.ElementType;
    isOpen: boolean;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-750 transition-colors rounded-lg mb-2"
    >
        <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        {isOpen ? (
            <ChevronDown className="w-5 h-5 text-slate-400" />
        ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
        )}
    </button>
);

// Individual Guide Item with Expand Logic using H3
const GuideItemCard = ({ item }: { item: GuideItem }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-md overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-white/5 transition-colors"
            >
                <h3 className="text-slate-200 font-medium">{item.name}</h3>
                {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
            </button>
            {isOpen && (
                <div className="p-3 pt-0 text-slate-300 text-sm border-t border-slate-700/30">
                    <div className="mt-2 text-slate-400 guide-content">{item.content}</div>
                </div>
            )}
        </div>
    );
};

// Renamed from SimpleList
// Used for Fractals, Strikes, Dungeons
const GuideList = ({ items }: { items: GuideItem[] }) => (
    <div className="flex flex-col gap-2 p-2">
        {items.map((item) => (
            <GuideItemCard key={item.id} item={item} />
        ))}
    </div>
);

// Used for Raids
const GroupedList = ({ categories }: { categories: GuideCategory[] }) => (
    <div className="space-y-6 p-2">
        {categories.map((cat) => (
            <div key={cat.title}>
                <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-slate-700/50 pb-2">
                    {cat.title}
                </h3>
                <div className="flex flex-col gap-2">
                    {cat.items.map((item) => (
                        <GuideItemCard key={item.id} item={item} />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

export default function GuidesPage() {
    // Independent state for each section
    const [openSections, setOpenSections] = useState({
        fractals: true,
        raids: false,
        strikes: false,
        dungeons: false,
    });

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-6 text-slate-100 pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Instanced Content Guides</h1>
                <p className="text-slate-400">Reference lists for Guild Wars 2 end-game content.</p>
            </div>

            <div className="space-y-4">
                {/* Fractals */}
                <div className="space-y-2">
                    <SectionHeader
                        title="Fractals of the Mists"
                        icon={Ghost}
                        isOpen={openSections.fractals}
                        onClick={() => toggleSection('fractals')}
                    />
                    {openSections.fractals && <GuideList items={FRACTALS} />}
                </div>

                {/* Raids */}
                <div className="space-y-2">
                    <SectionHeader
                        title="Raids"
                        icon={Crown}
                        isOpen={openSections.raids}
                        onClick={() => toggleSection('raids')}
                    />
                    {openSections.raids && <GroupedList categories={RAIDS} />}
                </div>

                {/* Strikes */}
                <div className="space-y-2">
                    <SectionHeader
                        title="Strike Missions"
                        icon={Swords}
                        isOpen={openSections.strikes}
                        onClick={() => toggleSection('strikes')}
                    />
                    {openSections.strikes && <GuideList items={STRIKES} />}
                </div>

                {/* Dungeons */}
                <div className="space-y-2">
                    <SectionHeader
                        title="Dungeons"
                        icon={Skull}
                        isOpen={openSections.dungeons}
                        onClick={() => toggleSection('dungeons')}
                    />
                    {openSections.dungeons && <GuideList items={DUNGEONS} />}
                </div>
            </div>
        </div>
    );
}
