import { ReactNode, forwardRef } from 'react';
import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { Home, Map, ChefHat, Bookmark, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// NavLink component
interface NavLinkCompatProps extends Omit<NavLinkProps, 'className'> {
  className?: string;
  activeClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, to, ...props }, ref) => (
    <RouterNavLink
      ref={ref}
      to={to}
      className={({ isActive }) => cn(className, isActive && activeClassName)}
      {...props}
    />
  )
);
NavLink.displayName = 'NavLink';

// BottomNav component
const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/map', icon: Map, label: 'Explore' },
  { to: '/cook', icon: ChefHat, label: 'Cook' },
  { to: '/collections', icon: Bookmark, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
];

function BottomNav() {
  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground transition-all"
            activeClassName="text-primary"
          >
            {({ isActive }: { isActive: boolean }) => (
              <>
                <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                <span className={cn('text-[10px] font-medium', isActive && 'text-primary font-semibold')}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// Main Layout component
interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={hideNav ? '' : 'pb-14'}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
