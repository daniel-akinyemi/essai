'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, ClipboardIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function APIKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    // This is a placeholder. In production, this would make an API call to generate a real key
    const key = 'sk_test_' + Array.from({ length: 24 }, () => 
      Math.random().toString(36).charAt(2)).join('');
    setApiKey(key);
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          as="div"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            API Key Management
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Generate and manage your API keys to integrate Essai into your applications
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-12"
          as="div"
        >
          <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-gray-100 p-8 shadow-xl shadow-indigo-100/20">
            <div className="space-y-8">
              {/* Key Generation Section */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Your API Key
                </h2>
                <p className="text-gray-600 mb-6">
                  Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                </p>
                
                {apiKey ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-gray-50 rounded-lg p-4 font-mono text-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                          <span className={showKey ? '' : 'blur-sm select-none'}>
                            {apiKey}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowKey(!showKey)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {showKey ? (
                                <EyeSlashIcon className="w-5 h-5 text-gray-600" />
                              ) : (
                                <EyeIcon className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                            <button
                              onClick={copyToClipboard}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                            >
                              <ClipboardIcon className="w-5 h-5 text-gray-600" />
                              {copied && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded">
                                  Copied!
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={generateKey}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Generate new key
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={generateKey}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 transition-all duration-300"
                  >
                    <KeyIcon className="w-5 h-5 mr-2" />
                    Generate API Key
                  </button>
                )}
              </div>

              {/* Usage Guidelines */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Start Guide
                </h3>
                <div className="bg-indigo-50/50 rounded-lg p-6 backdrop-blur-sm">
                  <pre className="text-sm text-gray-800 overflow-x-auto">
{`// Example API request
fetch('https://api.essai.com/v1/essays/evaluate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "Your essay content",
    type: "argumentative"
  })
})`}
                  </pre>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-yellow-50/50 rounded-lg p-6 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                  Security Notice
                </h4>
                <p className="text-sm text-yellow-700">
                  Keep your API key secure. If compromised, generate a new key immediately and update your applications.
                  Never commit API keys to version control or share them in public forums.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 