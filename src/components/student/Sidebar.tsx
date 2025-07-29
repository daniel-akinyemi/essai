'use client';

import { X, Home, FileText, Edit3, Sparkles, History, BookOpen, Users, Menu, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRef } from "react";
import { useTheme } from "@/components/Providers";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  onPageChange: (page: string) => void;
}

const navigationItems = [
  {
    id: 'overview',
    name: 'Dashboard Overview',
    icon: Home,
    href: '/dashboard',
    description: 'Your main dashboard'
  },
  {
    id: 'score-essay',
    name: 'Score Essay',
    icon: FileText,
    href: '/dashboard/score-essay',
    description: 'Submit essays for AI scoring'
  },
  {
    id: 'essay-rewriter',
    name: 'Essay Rewriter',
    icon: Edit3,
    href: '/dashboard/essay-rewriter',
    description: 'Improve your essays with AI'
  },
  {
    id: 'essay-generator',
    name: 'Essay Generator',
    icon: Sparkles,
    href: '/dashboard/essay-generator',
    description: 'Generate essays with AI (Pro)',
    pro: true
  },
  {
    id: 'paragraph-analyzer',
    name: 'Paragraph Analyzer',
    icon: Search,
    href: '/dashboard/paragraph-analyzer',
    description: 'Analyze paragraph relevance and flow'
  },
  {
    id: 'essay-history',
    name: 'Essay History',
    icon: History,
    href: '/dashboard/essay-history',
    description: 'View your submitted essays'
  },
  {
    id: 'writing-guide',
    name: 'Writing Guide',
    icon: Menu,
    href: '/dashboard/writing-guide',
    description: 'Essay writing tips and guides'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
    description: 'Manage your account settings'
  }
];

export default function Sidebar({ isOpen, onClose, activePage, onPageChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const { theme, setTheme } = useTheme();

  // Fetch user settings when drawer opens
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user || !(session.user as any).id) return;
      const res = await fetch('/api/user-settings', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.status === 401) {
        window.location.href = '/auth/signin';
        return;
      }
      const data = await res.json();
      // Use data as needed
    };
    fetchSettings();
    // eslint-disable-next-line
  }, [session?.user]);

  // Save settings
  // const handleSaveSettings = async () => { // Removed
  //   if (!(session?.user && (session.user as any).id)) return; // Removed
  //   await supabase.from('user_settings').upsert({ // Removed
  //     user_id: (session.user as any).id, // Removed
  //     email_notifications: emailNotif, // Removed
  //     push_notifications: pushNotif, // Removed
  //     theme, // Removed
  //     language, // Removed
  //     profile_picture_url: profilePicUrl, // Removed
  //   }, { onConflict: 'user_id' }); // Removed
  // }; // Removed

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      {/* Settings Drawer */}
      {/* Removed Sheet component for settings */}
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'w-20' : 'w-64'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            {!collapsed && <span className="text-xl font-bold text-gray-900">Essai</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:inline-flex p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu className="h-5 w-5" />
            </button>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <div key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => {
                    onPageChange(item.id);
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && item.name}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
} 