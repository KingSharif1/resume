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
  Search
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
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${isCollapsed ? 'justify-center px-4' : ''}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-semibold">
          {user.email?.[0].toUpperCase()}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.email}
            </p>
            <p className="text-xs text-slate-500">Resume Builder</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              } ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          onClick={() => {
            signOut();
            setMobileOpen(false);
          }}
          variant="ghost"
          className={`w-full text-slate-700 hover:bg-slate-100 ${isCollapsed ? 'justify-center px-4' : 'justify-start'}`}
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>

      {/* Toggle Button */}
      <div className={`absolute top-4 hidden lg:block ${collapsed ? '-right-3' : 'right-4'}`}>
        <Button
          onClick={() => setCollapsed(!collapsed)}
          variant="ghost"
          size="sm"
          className={`p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 ${collapsed ? 'bg-white border border-slate-200 shadow-sm' : ''}`}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 ${collapsed ? 'lg:w-20' : 'lg:w-64'} bg-white border-r border-slate-200 transition-all duration-300 relative`}>
        <SidebarContent isCollapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex flex-col w-64 bg-white">
            <SidebarContent isCollapsed={false} />
          </aside>
        </div>
      )}
    </>
  );
}
