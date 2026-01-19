import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface NavTabsProps {
    className?: string;
    itemClassName?: string;
    activeClassName?: string;
}

export default function NavTabs({ className, itemClassName, activeClassName }: NavTabsProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { name: 'Mastery', path: '/' },
        { name: 'Exploration', path: '/exploration' },
        { name: 'Guides', path: '/guides' },
    ];

    return (
        <nav className={cn('flex', className)} aria-label="Tabs">
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                    <button
                        key={tab.name}
                        onClick={() => navigate(tab.path)}
                        className={cn(
                            'whitespace-nowrap font-medium text-sm transition-all relative flex flex-col items-center justify-center',
                            isActive
                                ? cn('text-white', activeClassName)
                                : 'text-slate-400 hover:text-slate-200',
                            itemClassName
                        )}
                        aria-current={isActive ? 'page' : undefined}
                    >
                        {tab.name}
                        {isActive && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-t-full w-full" />
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
