import { cn } from '../../lib/utils';
import NavTabs from './NavTabs';

interface NavigationProps {
    className?: string;
}

export default function Navigation({ className }: NavigationProps) {
    return (
        <div className={cn("w-full bg-slate-900 border-b border-slate-800 shadow-sm md:hidden", className)}>
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <NavTabs className="space-x-8" itemClassName="py-3 px-1" />
            </div>
        </div>
    );
}
