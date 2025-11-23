'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { collapsed } = useSidebar();
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
      {children}
    </div>
  );
}
