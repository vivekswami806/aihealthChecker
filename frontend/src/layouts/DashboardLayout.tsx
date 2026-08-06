import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Upload, 
  History as HistoryIcon, 
  Activity, 
  MessageSquare, 
  Bell, 
  Settings, 
  Heart, 
  ChevronRight,
  Menu,
  X,
  Search,
  User,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';
import { logout } from '@/store/slices/authSlice';
import { toast } from 'sonner';

const sidebarLinks = [
  { name: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Upload Report', icon: Upload, path: '/dashboard/upload' },
  { name: 'Medical History', icon: HistoryIcon, path: '/dashboard/history' },
  { name: 'Health Timeline', icon: Activity, path: '/dashboard/timeline' },
  { name: 'AI Assistant', icon: MessageSquare, path: '/dashboard/assistant' },
  { name: 'Notifications', icon: Bell, path: '/dashboard/notifications', extra: <Badge className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full">3</Badge> },
  { name: 'Settings', icon: Settings, path: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex h-screen bg-muted/30 dark:bg-background transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? '260px' : '80px' }}
        className="hidden md:flex flex-col border-r bg-background overflow-hidden relative shadow-xl z-50"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Heart className="text-primary-foreground w-6 h-6 fill-current" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold tracking-tight whitespace-nowrap"
            >
              HealthAI<span className="text-primary">Pro</span>
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative
                  ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                `}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
                {isSidebarOpen && <span className="font-medium">{link.name}</span>}
                {isSidebarOpen && link.extra}
                {!isSidebarOpen && isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t">
          <Button 
            variant="ghost" 
            className="w-full flex justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
            onClick={() => {
              dispatch(logout());
              navigate('/');
            }}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </Button>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute right-[-12px] top-20 w-6 h-6 bg-background border flex items-center justify-center rounded-full shadow-md hover:bg-muted z-[60] transition-colors"
        >
          <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
        </button>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Header */}
        <header className="h-16 border-b bg-background/50 backdrop-blur-md px-4 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-muted/30 rounded-full px-4 py-2 gap-2 w-64 md:w-96 border focus-within:ring-2 ring-primary/20 transition-all focus-within:bg-background">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search everything..." 
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </form>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => dispatch(toggleTheme())}
              className="rounded-full hover:bg-primary/10 transition-colors"
            >
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative rounded-full hover:bg-primary/10 transition-colors"
              onClick={() => navigate('/dashboard/notifications')}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.6)]" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-xs">{user?.name?.charAt(0) || <User className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                </Button>
              } />
              <DropdownMenuContent className="w-64 mt-1 rounded-2xl p-2" align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal px-4 py-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user?.name || "Dr. Alex Carter"}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user?.email || "alex@healthai.pro"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem 
                    className="rounded-xl px-4 py-3 gap-2 cursor-pointer focus:bg-primary focus:text-primary-foreground"
                    onClick={() => navigate('/dashboard/settings')}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">Profile Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="rounded-xl px-4 py-3 gap-2 cursor-pointer focus:bg-primary focus:text-primary-foreground"
                    onClick={() => navigate('/dashboard/settings')}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem 
                    onClick={() => {
                      dispatch(logout());
                      navigate('/');
                    }} 
                    className="rounded-xl px-4 py-3 gap-2 cursor-pointer text-destructive focus:bg-destructive focus:text-destructive-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10 dark:bg-background/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
