import { Home, Map, ChefHat, PlusCircle, User } from 'lucide-react';
import { NavLink } from './NavLink';
import { cn } from '@/shared/utils';
import { ROUTES } from '@/shared/constants';

const navItems = [
  { to: ROUTES.HOME, icon: Home, label: 'Home' },
  { to: ROUTES.MAP, icon: Map, label: 'Explore' },
  { to: ROUTES.UPLOAD, icon: PlusCircle, label: 'Upload', isUpload: true },
  { to: ROUTES.COOK, icon: ChefHat, label: 'Cook' },
  { to: ROUTES.PROFILE, icon: User, label: 'Profiel' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground transition-all duration-200",
              item.isUpload && "relative"
            )}
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                {item.isUpload ? (
                  <div className="h-10 w-10 -mt-4 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                    <item.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                ) : (
                  <item.icon
                    className={cn(
                      'h-5 w-5 transition-all duration-200',
                      isActive && 'text-primary'
                    )}
                  />
                )}
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    isActive && 'text-primary font-semibold',
                    item.isUpload && 'mt-0.5'
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
