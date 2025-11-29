import { Home, Map, ChefHat, Bookmark, User } from 'lucide-react';
import { NavLink } from './NavLink';
import { cn } from '@/shared/utils';
import { ROUTES } from '@/shared/constants';

const navItems = [
  { to: ROUTES.HOME, icon: Home, label: 'Home' },
  { to: ROUTES.MAP, icon: Map, label: 'Explore' },
  { to: ROUTES.COOK, icon: ChefHat, label: 'Cook' },
  { to: ROUTES.COLLECTIONS, icon: Bookmark, label: 'Saved' },
  { to: ROUTES.PROFILE, icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground transition-all duration-200"
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-all duration-200',
                    isActive && 'text-primary'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isActive && 'text-primary font-semibold'
                  )}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
