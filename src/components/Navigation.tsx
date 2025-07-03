
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  Trophy, 
  LogOut, 
  Menu, 
  X,
  TrendingUp,
  Users
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NavigationProps {
  isAdmin?: boolean;
}

export const Navigation = ({ isAdmin = false }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });
  };

  const navigationItems = [
    { to: '/dashboard', icon: Home, label: 'Dashboard' },
    { to: '/course-content', icon: BookOpen, label: 'Course Content' },
    { to: '/progress', icon: TrendingUp, label: 'Progress' },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/community', icon: MessageSquare, label: 'Community' },
  ];

  if (isAdmin) {
    navigationItems.push({ to: '/admin', icon: Users, label: 'Admin Panel' });
  }

  const NavItem = ({ to, icon: Icon, label, onClick }: any) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Frontend Pro
            </NavLink>
            <div className="flex items-center gap-2">
              {navigationItems.map((item) => (
                <NavItem key={item.to + item.label} {...item} />
              ))}
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <NavLink to="/dashboard" className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frontend Pro
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        
        {isOpen && (
          <div className="border-t border-gray-200 p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavItem 
                key={item.to + item.label} 
                {...item} 
                onClick={() => setIsOpen(false)}
              />
            ))}
            <Button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              variant="outline"
              className="w-full flex items-center gap-2 mt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        )}
      </nav>
    </>
  );
};
