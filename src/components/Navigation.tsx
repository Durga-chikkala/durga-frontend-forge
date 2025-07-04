
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
  Users,
  Shield,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

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
    { to: '/dashboard', icon: Home, label: 'Dashboard', badge: null },
    { to: '/course-content', icon: BookOpen, label: 'Course Content', badge: null },
    { to: '/progress', icon: TrendingUp, label: 'Progress', badge: null },
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard', badge: null },
    { to: '/community', icon: MessageSquare, label: 'Community', badge: '3' },
  ];

  if (isAdmin) {
    navigationItems.push({ 
      to: '/admin', 
      icon: Shield, 
      label: 'Admin Panel', 
      badge: null 
    });
  }

  const NavItem = ({ to, icon: Icon, label, badge, onClick }: any) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-105'
        }`
      }
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="truncate">{label}</span>
      {badge && (
        <Badge className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {badge}
        </Badge>
      )}
    </NavLink>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Frontend Pro
              </div>
            </NavLink>
            <div className="flex items-center gap-2">
              {navigationItems.map((item) => (
                <NavItem key={item.to + item.label} {...item} />
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-gray-100 rounded-xl"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                2
              </Badge>
            </Button>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Frontend Pro
            </div>
          </NavLink>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center p-0">
                2
              </Badge>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {isOpen && (
          <div className="border-t border-gray-200 p-4 space-y-2 bg-white/95 backdrop-blur-sm">
            {navigationItems.map((item) => (
              <NavItem 
                key={item.to + item.label} 
                {...item} 
                onClick={() => setIsOpen(false)}
              />
            ))}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <Button
                onClick={() => {
                  handleSignOut();
                  setIsOpen(false);
                }}
                variant="outline"
                className="w-full flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
