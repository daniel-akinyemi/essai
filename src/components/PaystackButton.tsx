'use client';

import { useState, useCallback } from 'react';

export interface PaystackButtonProps {
  email: string;
  amount: number; // in kobo (e.g., 50000 for ₦500)
  publicKey: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
  text?: string;
  className?: string;
}

interface PaystackHandler {
  openIframe: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        text?: string;
        onSuccess: (response: any) => void;
        onClose: () => void;
        [key: string]: any;
      }) => PaystackHandler;
    };
  }
}

export default function PaystackButton({
  email,
  amount,
  publicKey,
  onSuccess,
  onClose,
  text = 'Pay Now',
  className = '',
}: PaystackButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(() => {
    if (isProcessing || !window.PaystackPop) {
      console.error('Paystack is not available or payment is already processing');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        text,
        onSuccess: (response: any) => {
          setIsProcessing(false);
          onSuccess(response);
        },
        onClose: () => {
          setIsProcessing(false);
          onClose();
        },
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Error initializing Paystack payment:', error);
      setIsProcessing(false);
    }
  }, [isProcessing, publicKey, email, amount, text, onSuccess, onClose]);

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={isProcessing}
      className={`${className} ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
      aria-busy={isProcessing}
    >
      {isProcessing ? 'Processing...' : text}
    </button>
  );
}
