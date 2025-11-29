import { Home, Map, ChefHat, Bookmark, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Feed' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/cook', icon: ChefHat, label: 'Cook' },
  { to: '/collections', icon: Bookmark, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isActive && "scale-110"
                  )} 
                />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}>
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
