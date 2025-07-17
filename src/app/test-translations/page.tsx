'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/components/Providers';

export default function TestTranslationsPage() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

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
            {t('testTranslations.title')}
          </h1>
          
          {/* Language Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('testTranslations.selectLanguage')}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
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
              <h2 className="font-semibold text-blue-900 mb-2">{t('testTranslations.common')}</h2>
              <p><strong>{t('common.save')}:</strong> {t('common.save')}</p>
              <p><strong>{t('common.loading')}:</strong> {t('common.loading')}</p>
              <p><strong>{t('common.settings')}:</strong> {t('common.settings')}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <h2 className="font-semibold text-green-900 mb-2">{t('testTranslations.navigation')}</h2>
              <p><strong>{t('navigation.dashboard')}:</strong> {t('navigation.dashboard')}</p>
              <p><strong>{t('navigation.essayGenerator')}:</strong> {t('navigation.essayGenerator')}</p>
              <p><strong>{t('navigation.settings')}:</strong> {t('navigation.settings')}</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl">
              <h2 className="font-semibold text-purple-900 mb-2">{t('testTranslations.settings')}</h2>
              <p><strong>{t('settings.title')}:</strong> {t('settings.title')}</p>
              <p><strong>{t('settings.subtitle')}:</strong> {t('settings.subtitle')}</p>
              <p><strong>{t('settings.theme')}:</strong> {t('settings.theme')}</p>
              <p><strong>{t('settings.language')}:</strong> {t('settings.language')}</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl">
              <h2 className="font-semibold text-orange-900 mb-2">{t('testTranslations.essayGenerator')}</h2>
              <p><strong>{t('essayGenerator.title')}:</strong> {t('essayGenerator.title')}</p>
              <p><strong>{t('essayGenerator.generateButton')}:</strong> {t('essayGenerator.generateButton')}</p>
              <p><strong>{t('essayGenerator.topicLabel')}:</strong> {t('essayGenerator.topicLabel')}</p>
            </div>

            <div className="p-4 bg-red-50 rounded-xl">
              <h2 className="font-semibold text-red-900 mb-2">{t('testTranslations.errors')}</h2>
              <p><strong>{t('errors.required')}:</strong> {t('errors.required')}</p>
              <p><strong>{t('errors.invalidEmail')}:</strong> {t('errors.invalidEmail')}</p>
              <p><strong>{t('errors.somethingWentWrong')}:</strong> {t('errors.somethingWentWrong')}</p>
            </div>
          </div>

          {/* Current Language Info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <strong>{t('testTranslations.currentLanguage')}:</strong> {language}
            </p>
            <p className="text-sm text-gray-600">
              <strong>{t('testTranslations.htmlLangAttribute')}:</strong> {typeof document !== 'undefined' ? document.documentElement.lang : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 