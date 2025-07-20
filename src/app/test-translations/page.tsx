'use client';

// import { useLanguage } from '@/components/Providers';

export default function TestTranslationsPage() {
  const language = 'en'; // fallback static value

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {/* {t('testTranslations.title')} */}
            Test Translations
          </h1>
          
          {/* Language Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {/* {t('testTranslations.selectLanguage')} */}
              Select Language
            </label>
            <select
              value={language}
              onChange={(e) => {}}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Translation Examples */}
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h2 className="font-semibold text-blue-900 mb-2">Common</h2>
              <p><strong>Save:</strong> Save</p>
              <p><strong>Loading:</strong> Loading</p>
              <p><strong>Settings:</strong> Settings</p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <h2 className="font-semibold text-green-900 mb-2">Navigation</h2>
              <p><strong>Dashboard:</strong> Dashboard</p>
              <p><strong>Essay Generator:</strong> Essay Generator</p>
              <p><strong>Settings:</strong> Settings</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <h2 className="font-semibold text-purple-900 mb-2">Settings</h2>
              <p><strong>Title:</strong> Title</p>
              <p><strong>Subtitle:</strong> Subtitle</p>
              <p><strong>Theme:</strong> Theme</p>
              <p><strong>Language:</strong> Language</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl">
              <h2 className="font-semibold text-orange-900 mb-2">Essay Generator</h2>
              <p><strong>Title:</strong> Title</p>
              <p><strong>Generate Button:</strong> Generate Button</p>
              <p><strong>Topic Label:</strong> Topic Label</p>
            </div>

            <div className="p-4 bg-red-50 rounded-xl">
              <h2 className="font-semibold text-red-900 mb-2">Errors</h2>
              <p><strong>Required:</strong> Required</p>
              <p><strong>Invalid Email:</strong> Invalid Email</p>
              <p><strong>Something Went Wrong:</strong> Something Went Wrong</p>
            </div>
          </div>

          {/* Current Language Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>Current Language:</strong> {language}
            </p>
            <p className="text-sm text-gray-600">
              <strong>HTML Lang Attribute:</strong> {typeof document !== 'undefined' ? document.documentElement.lang : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 