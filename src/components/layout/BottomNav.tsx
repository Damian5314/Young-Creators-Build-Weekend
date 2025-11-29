import { Home, Map, ChefHat, Bookmark, User } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/map', icon: Map, label: 'Explore' },
  { to: '/cook', icon: ChefHat, label: 'Cook' },
  { to: '/collections', icon: Bookmark, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
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
                    "h-5 w-5 transition-all duration-200",
                    isActive && "text-primary"
                  )}
                />
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-primary font-semibold"
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
