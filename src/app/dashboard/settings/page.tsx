'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Settings, 
  User, 
  Bell, 
  Palette, 
  Save, 
  Loader2, 
  CheckCircle, 
  Upload, 
  Shield, 
  BarChart3, 
  Eye,
  Globe,
  FileText,
  Clock,
  Sparkles,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings state
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showWritingTips, setShowWritingTips] = useState(true);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [autoSaveFrequency, setAutoSaveFrequency] = useState('30');
  const [writingStyle, setWritingStyle] = useState('academic');
  const [defaultEssayType, setDefaultEssayType] = useState('argumentative');
  const [preferredEssayLength, setPreferredEssayLength] = useState('medium');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  useEffect(() => {
    if (session?.user) {
      loadSettings();
    }
  }, [session?.user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePicUrl(data.profilePictureUrl || '');
        setEmailNotifications(data.emailNotifications ?? true);
        setPushNotifications(data.pushNotifications ?? false);
        setShowWritingTips(data.showWritingTips ?? true);
        setTheme(data.theme ?? 'system');
        setLanguage(data.language ?? 'en');
        setAutoSaveFrequency(data.autoSaveFrequency ?? '30');
        setWritingStyle(data.writingStyle ?? 'academic');
        setDefaultEssayType(data.defaultEssayType ?? 'argumentative');
        setPreferredEssayLength(data.essayLength ?? 'medium');
        setAnalyticsEnabled(data.analyticsEnabled ?? true);
        setDataSharing(data.dataSharing ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;
    
    setUploading(true);
    setUploadError('');
    
    try {
      // For now, we'll use a placeholder URL since we don't have file upload set up
      // In a real app, you'd upload to a service like Cloudinary, AWS S3, etc.
      const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=6366f1&color=fff&size=200`;
      setProfilePicUrl(placeholderUrl);
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/user-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profilePictureUrl: profilePicUrl,
          emailNotifications,
          pushNotifications,
          showWritingTips,
          theme,
          language,
          autoSaveFrequency,
          writingStyle,
          defaultEssayType,
          essayLength: preferredEssayLength,
          analyticsEnabled,
          dataSharing,
        }),
      });

      if (response.ok) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage('Failed to save settings. Please try again.');
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-gray-600">Customize your writing experience</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* 1. Profile Picture Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                Profile Picture
              </h2>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white">
                    {profilePicUrl ? (
                      <img 
                        src={profilePicUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  {uploadError && (
                    <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Writing Preferences */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Writing Preferences
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Style
                  </label>
                  <select
                    value={writingStyle}
                    onChange={(e) => setWritingStyle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="academic">Academic</option>
                    <option value="creative">Creative</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Essay Type
                  </label>
                  <select
                    value={defaultEssayType}
                    onChange={(e) => setDefaultEssayType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="argumentative">Argumentative</option>
                    <option value="expository">Expository</option>
                    <option value="narrative">Narrative</option>
                    <option value="descriptive">Descriptive</option>
                    <option value="persuasive">Persuasive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Essay Length
                  </label>
                  <select
                    value={preferredEssayLength}
                    onChange={(e) => setPreferredEssayLength(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="short">Short (300-500 words)</option>
                    <option value="medium">Medium (500-800 words)</option>
                    <option value="long">Long (800-1200 words)</option>
                    <option value="extended">Extended (1200+ words)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Auto-save Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                Auto-save Settings
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-save Frequency
                </label>
                <select
                  value={autoSaveFrequency}
                  onChange={(e) => setAutoSaveFrequency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="120">2 minutes</option>
                  <option value="300">5 minutes</option>
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  This controls how often your essays are automatically saved
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* 4. Notifications */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                Notifications
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Email notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Push notifications</h3>
                    <p className="text-sm text-gray-600">Get real-time browser notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => setPushNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Show writing tips</h3>
                    <p className="text-sm text-gray-600">Display helpful writing suggestions</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showWritingTips}
                      onChange={(e) => setShowWritingTips(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 5. Privacy & Analytics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                Privacy & Analytics
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Enable analytics</h3>
                    <p className="text-sm text-gray-600">Help improve the platform</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Data sharing for improvement</h3>
                    <p className="text-sm text-gray-600">Contribute to better features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataSharing}
                      onChange={(e) => setDataSharing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 6. Appearance */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Palette className="h-4 w-4 text-white" />
                </div>
                Appearance
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 7. User Menu */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                User Profile
              </h2>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg border-4 border-white">
                  {profilePicUrl ? (
                    <img 
                      src={profilePicUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {session?.user?.name || 'User'}
                  </h3>
                  <p className="text-gray-600">{session?.user?.email}</p>
                </div>
              </div>
              
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center gap-4">
              {message && (
                <div className={`flex items-center gap-2 text-sm ${
                  message.includes('successfully') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message.includes('successfully') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : null}
                  {message}
                </div>
              )}
              <button
                onClick={saveSettings}
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 