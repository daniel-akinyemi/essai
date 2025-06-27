'use client';

import { X, Home, FileText, Edit3, Sparkles, History, BookOpen, Users, Settings, Menu } from "lucide-react";
import Link from "next/link";

interface StudentSidebarProps {
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
    href: '/dashboard/student',
    description: 'Your main dashboard'
  },
  {
    id: 'submit-essay',
    name: 'Submit Essay',
    icon: FileText,
    href: '/dashboard/student/submit-essay',
    description: 'Submit essays for AI scoring'
  },
  {
    id: 'essay-rewriter',
    name: 'Essay Rewriter',
    icon: Edit3,
    href: '/dashboard/student/essay-rewriter',
    description: 'Improve your essays with AI'
  },
  {
    id: 'essay-generator',
    name: 'Essay Generator',
    icon: Sparkles,
    href: '/dashboard/student/essay-generator',
    description: 'Generate essays with AI (Pro)',
    pro: true
  },
  {
    id: 'essay-history',
    name: 'Essay History',
    icon: History,
    href: '/dashboard/student/essay-history',
    description: 'View your submitted essays'
  },
  {
    id: 'assignments',
    name: 'Assignments',
    icon: BookOpen,
    href: '/dashboard/student/assignments',
    description: 'View and submit assignments'
  },
  {
    id: 'join-class',
    name: 'Join Class',
    icon: Users,
    href: '/dashboard/student/join-class',
    description: 'Join a class with code'
  },
  {
    id: 'writing-guide',
    name: 'Writing Guide',
    icon: Menu,
    href: '/dashboard/student/writing-guide',
    description: 'Essay writing tips and guides'
  }
];

export default function StudentSidebar({ isOpen, onClose, activePage, onPageChange }: StudentSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Essai</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.pro && (
                        <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
        </div>
      </div>
    </>
  );
} 