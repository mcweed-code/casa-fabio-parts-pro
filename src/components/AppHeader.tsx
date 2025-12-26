import { NavLink, useLocation } from 'react-router-dom';
import { Moon, Sun, Home, User, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useAppStore } from '@/store/useAppStore';
import logoSvg from '@/assets/logo.svg';

export function AppHeader() {
  const { theme, toggleTheme } = useAppStore();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/cliente', icon: User, label: 'Mis Datos' },
    { path: '/catalogos', icon: FileText, label: 'Catálogos' },
  ];

  return (
    <TooltipProvider>
      <header className="h-10 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 flex items-center px-3">
        {/* Logo a la izquierda */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <img src={logoSvg} alt="Casa Fabio" className="h-6" />
        </NavLink>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navegación y controles a la derecha */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Tooltip key={path}>
              <TooltipTrigger asChild>
                <NavLink to={path}>
                  <Button
                    variant={location.pathname === path ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}

          <div className="w-px h-5 bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-7 w-7 p-0"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
            </TooltipContent>
          </Tooltip>
        </nav>
      </header>
    </TooltipProvider>
  );
}
