import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useAppStore } from '@/store/useAppStore';

export function Header() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <img 
            src="/logo.svg" 
            alt="Casa Fabio" 
            className="h-10 text-foreground"
          />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
