'use client';

import { X, Home, FileText, Edit3, Sparkles, History, BookOpen, Users, Settings, Menu } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRef } from "react";
import { useTheme } from "@/components/Providers";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";

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
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { data: session } = useSession();
  const supabase = createClientComponentClient();
  const { theme, setTheme } = useTheme();

  // Settings state
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [language, setLanguage] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile picture upload handler
  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;
    setUploading(true);
    setUploadError(null);
    const supabase = createClientComponentClient();
    const fileExt = file.name.split('.').pop();
    const filePath = `${(session.user as any).id}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('profile-pictures').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setUploadError("Upload failed. Please try again.");
      setUploading(false);
      return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('profile-pictures').getPublicUrl(filePath);
    if (publicUrlData?.publicUrl) {
      setProfilePicUrl(publicUrlData.publicUrl);
    } else {
      setUploadError("Could not get public URL.");
    }
    setUploading(false);
  };

  // Fetch user settings when drawer opens
  useEffect(() => {
    const fetchSettings = async () => {
      if (!showSettings || !(session?.user && (session.user as any).id)) return;
      setSettingsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('email_notifications, push_notifications, theme, language, profile_picture_url')
        .eq('user_id', (session.user as any).id)
        .single();
      if (!error && data) {
        setEmailNotif(data.email_notifications);
        setPushNotif(data.push_notifications);
        setLanguage(data.language || "");
        setProfilePicUrl(data.profile_picture_url || "");
      }
      setSettingsLoading(false);
    };
    fetchSettings();
    // eslint-disable-next-line
  }, [showSettings, session?.user?.id]);

  // Save settings
  const handleSaveSettings = async () => {
    if (!(session?.user && (session.user as any).id)) return;
    setSettingsSaving(true);
    await supabase.from('user_settings').upsert({
      user_id: (session.user as any).id,
      email_notifications: emailNotif,
      push_notifications: pushNotif,
      theme,
      language,
      profile_picture_url: profilePicUrl,
    }, { onConflict: 'user_id' });
    setSettingsSaving(false);
    setShowSettings(false);
  };

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
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${collapsed ? 'justify-center px-2' : ''}
                  `}
                  title={item.name}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {!collapsed && (
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span>{item.name}</span>
                      {item.pro && (
                        <span className="px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                          PRO
                        </span>
                      )}
                    </div>
                      <p className={`text-xs mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{item.description}</p>
                  </div>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 ${collapsed ? 'flex flex-col items-center' : ''}`}>
          {/* Removed Settings Sheet */}
        </div>
      </div>
    </>
  );
} 