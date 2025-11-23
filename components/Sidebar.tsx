'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import {
  Home,
  FileText,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  Upload,
  BarChart3,
  Search,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'My Resumes', href: '/dashboard', icon: FileText },
  { name: 'Resume Builder', href: '/builder', icon: FileText },
  { name: 'Job Opportunities', href: '/jobs', icon: Search },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const SidebarContent = ({ isCollapsed = false }) => (
    <>
      <div className={`flex items-center gap-3 px-6 py-5 border-b border-border ${isCollapsed ? 'justify-center px-4' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
          {user.email?.[0].toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">Pro Plan</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <Button
          onClick={() => {
            signOut();
            setMobileOpen(false);
          }}
          variant="ghost"
          className={`w-full text-muted-foreground hover:text-foreground hover:bg-accent ${isCollapsed ? 'justify-center px-2' : 'justify-start'}`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>

      {/* Toggle Button */}
      <div className={`absolute top-5 hidden lg:block ${collapsed ? '-right-3' : 'right-4'}`}>
        <Button
          onClick={() => setCollapsed(!collapsed)}
          variant="ghost"
          size="sm"
          className={`p-1.5 h-auto text-muted-foreground hover:text-foreground hover:bg-accent ${collapsed ? 'bg-card border border-border shadow-sm' : ''}`}
        >
          {collapsed ? <Menu className="w-3 h-3" /> : <X className="w-3 h-3" />}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card text-foreground shadow-lg border border-border"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 ${collapsed ? 'lg:w-20' : 'lg:w-64'} bg-card border-r border-border transition-all duration-300 relative z-40`}>
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-card border-r border-border">
            <SidebarContent isCollapsed={false} />
          </aside>
        </div>
      )}
    </>
  );
}
