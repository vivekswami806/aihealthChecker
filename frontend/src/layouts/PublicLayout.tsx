import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const mode = useSelector((state: RootState) => state.theme.mode);

  const navLinks = [
    { name: 'About', path: '/about' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Heart className="text-primary-foreground w-6 h-6 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">HealthAI<span className="text-primary">Pro</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleTheme())}
                className="rounded-full"
              >
                {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Link to="/auth/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleTheme())}
            >
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col space-y-2">
                <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Log in</Button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-muted/50 border-t py-12 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="space-y-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Heart className="text-primary-foreground w-5 h-5 fill-current" />
          </div>
          <span className="text-lg font-bold">HealthAI Pro</span>
        </Link>
        <p className="text-sm text-muted-foreground">
          Revolutionizing healthcare with AI-powered insights and comprehensive health tracking.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Product</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Features</li>
          <li>Solution</li>
          <li>Pricing</li>
          <li>Releases</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Company</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>About</li>
          <li>Careers</li>
          <li>Contact</li>
          <li>Privacy</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-4">Support</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Help Center</li>
          <li>API Reference</li>
          <li>Status</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
      <p>© 2024 HealthAI Pro Inc. All rights reserved.</p>
      <div className="flex space-x-6 mt-4 md:mt-0">
        <span>Terms</span>
        <span>Privacy</span>
        <span>Cookies</span>
      </div>
    </div>
  </footer>
);

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
