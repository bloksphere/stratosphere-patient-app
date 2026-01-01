'use client';

import { Bell, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Page title - hidden on mobile, can be used for breadcrumbs */}
      <div className="hidden lg:block">
        {/* Placeholder for breadcrumbs or page title */}
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-500" />
          {/* Notification badge */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User avatar (mobile) */}
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center lg:hidden">
          <span className="text-primary-700 text-sm font-medium">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </span>
        </div>
      </div>
    </header>
  );
}
