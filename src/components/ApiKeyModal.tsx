'use client';

import { useState } from 'react';
import PaystackButton from './PaystackButton';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  amount: number;
  publicKey: string;
}

export default function ApiKeyModal({ isOpen, onClose, email, amount, publicKey }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePaymentSuccess = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would verify the payment with your backend
      // and then generate/return an API key
      const res = await fetch('/api/generate-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: response.reference,
          email,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate API key');
      }

      const data = await res.json();
      setApiKey(data.apiKey);
    } catch (err) {
      console.error('Error generating API key:', err);
      setError('Failed to generate API key. Please contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      // You can add a toast notification here
      alert('API key copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Get Your API Key</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {!apiKey ? (
          <>
            <p className="mb-4">
              Pay ₦{(amount / 100).toLocaleString()} to get your API key. This is a one-time payment.
            </p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              
              <PaystackButton
                email={email}
                amount={amount}
                publicKey={publicKey}
                onSuccess={handlePaymentSuccess}
                onClose={() => setIsLoading(false)}
                text={isLoading ? 'Processing...' : 'Pay Now'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              />
            </div>
          </>
        ) : (
          <div>
            <p className="mb-4">Your API key has been generated successfully!</p>
            <div className="flex items-center mb-6">
              <code className="bg-gray-100 p-2 rounded flex-1 overflow-x-auto">
                {apiKey}
              </code>
              <button
                onClick={copyToClipboard}
                className="ml-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please save this API key securely. You won't be able to see it again.
            </p>
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
