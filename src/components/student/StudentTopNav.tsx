'use client';

import { Menu, Bell, User, LogOut, ChevronDown, CheckCircle, FileText, BookOpen, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useTheme } from "@/components/Providers";

interface StudentTopNavProps {
  onMenuClick: () => void;
  user?: any;
  onSignOut?: () => void;
}

export default function StudentTopNav({ onMenuClick, user, onSignOut }: StudentTopNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [language, setLanguage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    setNotifLoading(true);
    setNotifError(null);
    const supabase = createClientComponentClient();
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setNotifError('Failed to load notifications');
        else setNotifications(data || []);
        setNotifLoading(false);
      });
  }, [user?.id, showNotif]);

  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClientComponentClient();
    supabase
      .from('user_settings')
      .select('profile_picture_url')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.profile_picture_url) setProfilePicUrl(data.profile_picture_url);
      });
  }, [user?.id]);

  // Profile picture upload handler
  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploading(true);
    setUploadError(null);
    const supabase = createClientComponentClient();
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
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
    if (!showSettings || !user?.id) return;
    setSettingsLoading(true);
    const supabase = createClientComponentClient();
    supabase
      .from('user_settings')
      .select('email_notifications, push_notifications, theme, language, profile_picture_url')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setEmailNotif(data.email_notifications);
          setPushNotif(data.push_notifications);
          setLanguage(data.language || "");
          setProfilePicUrl(data.profile_picture_url || "");
        }
        setSettingsLoading(false);
      });
  }, [showSettings, user?.id]);

  const handleMarkAsRead = async (notifId: string) => {
    const supabase = createClientComponentClient();
    await supabase.from('notifications').update({ read: true }).eq('id', notifId);
    setNotifications((prev) => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  // Save settings
  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    const supabase = createClientComponentClient();
    await supabase.from('user_settings').upsert({
      user_id: user.id,
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
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      {/* Left side - Menu button and title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden lg:block">
          <h1 className="text-xl font-semibold text-gray-900">Student Dashboard</h1>
        </div>
      </div>

      {/* Right side - Notifications and user menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 relative"
            onClick={() => setShowNotif((v) => !v)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 border border-gray-200 animate-fadeIn">
              <div className="p-4 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-500" /> Notifications
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {notifLoading ? (
                  <div className="p-4 text-gray-500 text-sm">Loading...</div>
                ) : notifError ? (
                  <div className="p-4 text-red-500 text-sm">{notifError}</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm">No new notifications</div>
                ) : notifications.map((notif, idx) => (
                  <div
                    key={notif.id || idx}
                    className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${notif.read ? 'opacity-60' : 'font-semibold bg-blue-50'}`}
                  >
                    <span className="h-4 w-4 text-blue-500">🔔</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-800">{notif.message}</div>
                      <div className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</div>
                    </div>
                    {!notif.read && (
                      <button
                        className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-2 text-center">
                <button className="text-blue-600 text-sm font-medium hover:underline">View all</button>
              </div>
            </div>
          )}
          {/* Overlay to close notification dropdown */}
          {showNotif && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotif(false)}
            />
          )}
        </div>

        {/* Settings button */}
        <Sheet open={showSettings} onOpenChange={setShowSettings}>
          <SheetTrigger asChild>
            <button
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="max-w-md w-full">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
            </SheetHeader>
            <div className="p-4 space-y-6">
              {settingsLoading ? (
                <div className="text-center text-gray-500 py-8">Loading settings...</div>
              ) : (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl overflow-hidden">
                        {profilePicUrl ? (
                          <img src={profilePicUrl} alt="Profile" className="w-16 h-16 object-cover rounded-full" />
                        ) : (
                          <span role="img" aria-label="profile">👤</span>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleProfilePicUpload}
                      />
                      <button
                        className="px-3 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Upload"}
                      </button>
                    </div>
                    {uploadError && <div className="text-red-600 text-xs mt-1">{uploadError}</div>}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Notifications</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700">Email notifications</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Push notifications</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={pushNotif} onChange={e => setPushNotif(e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:bg-purple-600 transition"></div>
                      </label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Theme</h3>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Language</h3>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      value={language || ''}
                      onChange={e => setLanguage(e.target.value)}
                    >
                      <option value="">Select language</option>
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                  <SheetFooter>
                    <button
                      className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow disabled:opacity-60"
                      onClick={handleSaveSettings}
                      disabled={settingsSaving}
                    >
                      {settingsSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                  </SheetFooter>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              {profilePicUrl ? (
                <img src={profilePicUrl} alt="Profile" className="w-8 h-8 object-cover rounded-full" />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || 'Student'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || 'student@example.com'}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Student'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || 'student@example.com'}
                </p>
              </div>
              <button
                onClick={() => {
                  onSignOut?.();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
} 