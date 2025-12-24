import { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen max-h-screen flex flex-col bg-background overflow-hidden">
      <AppHeader />
      {children}
    </div>
  );
}
