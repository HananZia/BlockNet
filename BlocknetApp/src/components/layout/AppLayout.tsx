import { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  FileUp,
  Share2, 
  Blocks, 
  Shield,
  User,
  LogOut,
  Settings
} from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Home' },
  { path: '/files', icon: FileUp, label: 'Files' },
  { path: '/sharing', icon: Share2, label: 'Share' },
  { path: '/explorer', icon: Blocks, label: 'Explorer' },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add admin link if user is admin
  const allNavItems = isAdmin 
    ? [...navItems, { path: '/admin', icon: Shield, label: 'Admin' }]
    : navItems;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">BlockNet</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border/50 safe-area-bottom z-50">
        <div className="flex items-center justify-around h-16">
          {allNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                <span className={cn('text-xs', isActive && 'font-medium')}>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
