import { useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, Home, User, FileText, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/hooks/useAuth';
import logoSvg from '@/assets/logo.svg';

export function AppHeader() {
  const { theme, toggleTheme } = useAppStore();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/cliente', label: 'Mis Datos', icon: User },
    { path: '/catalogos', label: 'Catálogos', icon: FileText },
  ];

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-3 h-12 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img
            src={logoSvg}
            alt="Casa Fabio"
            className="h-9 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* User info (mobile hidden) */}
          {profile && (
            <span className="hidden lg:block text-xs text-muted-foreground max-w-32 truncate">
              {profile.razon_social}
            </span>
          )}
          
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden border-t border-border">
        <nav className="flex items-center justify-around py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex-col h-auto py-1 gap-0.5"
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
