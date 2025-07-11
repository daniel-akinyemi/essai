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
import { useTheme } from '@/components/Providers';
import supabase from '@/lib/supabase/client';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [showWritingTips, setShowWritingTips] = useState(true);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [autoSaveFrequency, setAutoSaveFrequency] = useState('30');
  const [writingStyle, setWritingStyle] = useState('academic');
  const [preferredEssayLength, setPreferredEssayLength] = useState('medium');
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  // Separate state for manual save sections
  const [writingPreferencesSaving, setWritingPreferencesSaving] = useState(false);
  const [autoSaveSaving, setAutoSaveSaving] = useState(false);
  const [writingPreferencesMessage, setWritingPreferencesMessage] = useState('');
  const [autoSaveMessage, setAutoSaveMessage] = useState('');

  // Local state for writing preferences (not auto-saved)
  const [localWritingStyle, setLocalWritingStyle] = useState('academic');
  const [localPreferredEssayLength, setLocalPreferredEssayLength] = useState('medium');

  // Local state for auto-save settings (not auto-saved)
  const [localAutoSaveFrequency, setLocalAutoSaveFrequency] = useState('30');

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
        setEmailNotifications(data.emailNotifications ?? true);
        setShowWritingTips(data.showWritingTips ?? true);
        setTheme(data.theme ?? 'system');
        setLanguage(data.language ?? 'en');
        setAutoSaveFrequency(data.autoSaveFrequency ?? '30');
        setWritingStyle(data.writingStyle ?? 'academic');
        setPreferredEssayLength(data.essayLength ?? 'medium');
        setAnalyticsEnabled(data.analyticsEnabled ?? true);
        setDataSharing(data.dataSharing ?? false);
        
        // Set local state for manual save sections
        setLocalWritingStyle(data.writingStyle ?? 'academic');
        setLocalPreferredEssayLength(data.essayLength ?? 'medium');
        setLocalAutoSaveFrequency(data.autoSaveFrequency ?? '30');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // When user selects a new theme, update both local state and app theme instantly
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
    setAppTheme(e.target.value);
  };

  // Auto-save handler
  const autoSaveSetting = (updates: Partial<any>) => {
    setSaving(true);
    setMessage('');
    // Update local state
    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'theme') {
        setTheme(value as string);
        setAppTheme(value as string);
      } else if (key === 'emailNotifications') {
        setEmailNotifications(!!value);
      } else if (key === 'showWritingTips') {
        setShowWritingTips(!!value);
      } else if (key === 'language') {
        setLanguage(value as string);
      } else if (key === 'autoSaveFrequency') {
        setAutoSaveFrequency(value as string);
      } else if (key === 'writingStyle') {
        setWritingStyle(value as string);
      } else if (key === 'essayLength') {
        setPreferredEssayLength(value as string);
      } else if (key === 'analyticsEnabled') {
        setAnalyticsEnabled(!!value);
      } else if (key === 'dataSharing') {
        setDataSharing(!!value);
      }
    });
    // Save to backend
    fetch('/api/user-settings', {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications,
          showWritingTips,
          theme,
          language,
          autoSaveFrequency,
          writingStyle,
          essayLength: preferredEssayLength,
          analyticsEnabled,
          dataSharing,
        ...updates,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setMessage('Saved!');
          setTimeout(() => setMessage(''), 1500);
      } else {
          setMessage('Failed to save.');
        }
      })
      .catch(() => setMessage('Failed to save.'))
      .finally(() => setSaving(false));
  };

  // Save writing preferences manually
  const saveWritingPreferences = async () => {
    setWritingPreferencesSaving(true);
    setWritingPreferencesMessage('');
    
    try {
      const response = await fetch('/api/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications,
          showWritingTips,
          theme,
          language,
          autoSaveFrequency,
          writingStyle: localWritingStyle,
          essayLength: localPreferredEssayLength,
          analyticsEnabled,
          dataSharing,
        }),
      });

      if (response.ok) {
        // Update the main state to reflect saved values
        setWritingStyle(localWritingStyle);
        setPreferredEssayLength(localPreferredEssayLength);
        setWritingPreferencesMessage('Writing preferences saved!');
        setTimeout(() => setWritingPreferencesMessage(''), 1500);
      } else {
        setWritingPreferencesMessage('Failed to save writing preferences.');
      }
    } catch (error) {
      setWritingPreferencesMessage('Failed to save writing preferences.');
    } finally {
      setWritingPreferencesSaving(false);
    }
  };

  // Save auto-save settings manually
  const saveAutoSaveSettings = async () => {
    setAutoSaveSaving(true);
    setAutoSaveMessage('');
    
    try {
      const response = await fetch('/api/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotifications,
          showWritingTips,
          theme,
          language,
          autoSaveFrequency: localAutoSaveFrequency,
          writingStyle,
          essayLength: preferredEssayLength,
          analyticsEnabled,
          dataSharing,
        }),
      });

      if (response.ok) {
        // Update the main state to reflect saved values
        setAutoSaveFrequency(localAutoSaveFrequency);
        setAutoSaveMessage('Auto-save settings saved!');
        setTimeout(() => setAutoSaveMessage(''), 1500);
      } else {
        setAutoSaveMessage('Failed to save auto-save settings.');
      }
    } catch (error) {
      setAutoSaveMessage('Failed to save auto-save settings.');
    } finally {
      setAutoSaveSaving(false);
    }
  };

  if (loading) {
    // Render layout instantly and show skeletons for profile and settings sections
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
                <div className="h-8 w-40 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
          {/* Profile Skeleton */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white mb-3 bg-gray-200 animate-pulse" />
            <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
            <div className="mt-4 h-10 w-40 bg-gray-200 rounded-xl animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column Skeletons */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
                <div className="space-y-6">
                  <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            {/* Right Column Skeletons */}
            <div className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          </div>
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

        {/* User Profile Picture and Info at Top (Unified) */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-white mb-3">
                    {/* Remove all profile picture upload, display, and state logic */}
                    {/* Remove profilePictureUrl state, upload handlers, and UI */}
                    {/* Remove references to profilePictureUrl in loadSettings, autoSaveSetting, and fetch/save payloads */}
                    {/* The profile picture section is now removed as per the edit hint */}
                  </div>
          <h3 className="font-semibold text-gray-900 text-lg">{session?.user?.name || 'User'}</h3>
          <p className="text-gray-600">{session?.user?.email}</p>
          {/* Remove all profile picture upload, display, and state logic */}
          {/* Remove profilePictureUrl state, upload handlers, and UI */}
          {/* Remove references to profilePictureUrl in loadSettings, autoSaveSetting, and fetch/save payloads */}
          {/* The profile picture section is now removed as per the edit hint */}
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Writing Preferences (now first) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  Writing Preferences
                </span>
                <button
                  onClick={saveWritingPreferences}
                  disabled={writingPreferencesSaving}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium shadow hover:from-green-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {writingPreferencesSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Style
                  </label>
                  <select
                    value={localWritingStyle}
                    onChange={(e) => setLocalWritingStyle(e.target.value)}
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
                    Preferred Essay Length
                  </label>
                  <select
                    value={localPreferredEssayLength}
                    onChange={(e) => setLocalPreferredEssayLength(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="short">Short (300-500 words)</option>
                    <option value="medium">Medium (500-800 words)</option>
                    <option value="long">Long (800-1200 words)</option>
                    <option value="extended">Extended (1200+ words)</option>
                  </select>
                </div>

                {/* Save Button and Status */}
                {writingPreferencesMessage && (
                  <div className="flex justify-end mt-2">
                    <div className={`flex items-center gap-2 text-sm ${writingPreferencesMessage.includes('saved!') ? 'text-green-600' : 'text-red-600'}`}> 
                      {writingPreferencesMessage.includes('saved!') ? <CheckCircle className="h-4 w-4" /> : null}
                      {writingPreferencesMessage}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Auto-save Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-between gap-3">
                <span className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  Auto-save Settings
                </span>
                <button
                  onClick={saveAutoSaveSettings}
                  disabled={autoSaveSaving}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium shadow hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {autoSaveSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-save Frequency
                </label>
                <select
                  value={localAutoSaveFrequency}
                  onChange={(e) => setLocalAutoSaveFrequency(e.target.value)}
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
                {/* Save Button and Status */}
                {autoSaveMessage && (
                  <div className="flex justify-end mt-2">
                    <div className={`flex items-center gap-2 text-sm ${autoSaveMessage.includes('saved!') ? 'text-green-600' : 'text-red-600'}`}> 
                      {autoSaveMessage.includes('saved!') ? <CheckCircle className="h-4 w-4" /> : null}
                      {autoSaveMessage}
                    </div>
                  </div>
                )}
                
                {/* Test Auto-save Button */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Test Auto-save</h4>
                  <p className="text-xs text-blue-600 mb-3">
                    This setting controls how often your essays are automatically saved while writing in the Essay Generator, Rewriter, and Submit pages.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-700">
                      Current: Every {localAutoSaveFrequency} seconds
                    </span>
                    <button
                      onClick={() => {
                        // Test auto-save by saving a sample draft
                        fetch('/api/autoSave', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            content: 'This is a test auto-save draft created at ' + new Date().toLocaleTimeString(),
                            topic: 'Auto-save Test',
                            type: 'Test'
                          })
                        }).then(() => {
                          setAutoSaveMessage('Test auto-save successful!');
                          setTimeout(() => setAutoSaveMessage(''), 3000);
                        }).catch(() => {
                          setAutoSaveMessage('Test auto-save failed.');
                          setTimeout(() => setAutoSaveMessage(''), 3000);
                        });
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Test Now
                    </button>
                  </div>
                </div>
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
                      onChange={(e) => autoSaveSetting({ emailNotifications: e.target.checked })}
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
                      onChange={(e) => autoSaveSetting({ showWritingTips: e.target.checked })}
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
                      onChange={(e) => autoSaveSetting({ analyticsEnabled: e.target.checked })}
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
                      onChange={(e) => autoSaveSetting({ dataSharing: e.target.checked })}
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
                    onChange={handleThemeChange}
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
                    onChange={(e) => autoSaveSetting({ language: e.target.value })}
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
            {/* Remove profile info from 'User Profile' card, keep only sign out button at the bottom of the page */}
          </div>
                </div>

        {/* Saving Indicator */}
        {saving && (
          <div className="mt-8 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            </div>
          </div>
        )}

        {message && (
        <div className="mt-8 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
                <div className={`flex items-center gap-2 text-sm ${
                message.includes('successfully') || message.includes('Saved!') ? 'text-green-600' : 'text-red-600'
                }`}>
                {message.includes('successfully') || message.includes('Saved!') ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : null}
                  {message}
                </div>
            </div>
          </div>
        )}

        {/* Sign Out Button at Bottom */}
        <div className="mt-12 flex items-center justify-center">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full max-w-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 