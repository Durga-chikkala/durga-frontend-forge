
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  Trophy, 
  Users, 
  Settings, 
  LogOut, 
  Bell,
  Menu,
  X,
  Shield,
  GraduationCap,
  Target,
  Zap
} from 'lucide-react';

interface NavigationProps {
  isAdmin?: boolean;
}

export const Navigation = ({ isAdmin = false }: NavigationProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchNotifications();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setProfile(data);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    
    // Get recent activities count as notifications
    const { count } = await supabase
      .from('user_activities')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    
    setNotifications(count || 0);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Your learning hub'
    },
    { 
      path: '/course-content', 
      label: 'Course Content', 
      icon: BookOpen,
      description: 'Lessons & materials'
    },
    { 
      path: '/progress', 
      label: 'Progress', 
      icon: TrendingUp,
      description: 'Track your journey'
    },
    { 
      path: '/leaderboard', 
      label: 'Leaderboard', 
      icon: Trophy,
      description: 'Compare with peers'
    },
    { 
      path: '/community', 
      label: 'Community', 
      icon: Users,
      description: 'Connect & discuss'
    },
  ];

  if (isAdmin) {
    navItems.push({ 
      path: '/admin', 
      label: 'Admin', 
      icon: Shield,
      description: 'Manage platform'
    });
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => navigate('/dashboard')}
          >
            <div className="relative p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <GraduationCap className="w-6 h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-0 group-hover:opacity-30 transition-opacity duration-200"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Frontend Bootcamp
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Learn. Build. Excel.</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative group px-4 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : ''}`} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
                  )}
                  
                  {/* Hover tooltip */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {item.description}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost" 
                size="sm"
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
                onClick={() => navigate('/dashboard')}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </Badge>
                )}
              </Button>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-1 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 ring-2 ring-gradient-to-r from-blue-400 to-purple-400">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {profile?.full_name?.split(' ')[0] || 'Student'}
                      </p>
                      <p className="text-xs text-gray-500 leading-tight">
                        {isAdmin ? 'Administrator' : 'Student'}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 p-2 bg-white/95 backdrop-blur-lg border border-gray-200/50 shadow-xl rounded-xl">
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <p className="font-semibold text-gray-900">{profile?.full_name || 'Student'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  {isAdmin && (
                    <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                
                <DropdownMenuItem 
                  className="gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate('/progress')}
                >
                  <div className="p-1 bg-blue-100 rounded-lg">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">My Progress</p>
                    <p className="text-xs text-gray-500">View learning stats</p>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate('/leaderboard')}
                >
                  <div className="p-1 bg-yellow-100 rounded-lg">
                    <Zap className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Achievements</p>
                    <p className="text-xs text-gray-500">View milestones</p>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuItem 
                  className="gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="gap-3 p-3 rounded-lg hover:bg-red-50 cursor-pointer transition-colors duration-200 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
            <div className="py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : ''}`} />
                    <div className="text-left">
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
