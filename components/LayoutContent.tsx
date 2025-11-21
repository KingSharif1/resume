'use client';

import { useSidebar } from '@/contexts/SidebarContext';

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const { collapsed } = useSidebar();

  return (
    <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
      {children}
    </div>
  );
}
