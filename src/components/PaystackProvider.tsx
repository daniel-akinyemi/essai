'use client';

import { useEffect, ReactNode, useCallback } from 'react';

interface PaystackPopSetupOptions {
  key: string;
  email: string;
  amount: number;
  text?: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
  [key: string]: any;
}

export interface PaystackHandler {
  openIframe: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackPopSetupOptions) => PaystackHandler;
    };
  }
}

interface PaystackProviderProps {
  children: ReactNode;
  onScriptLoad?: () => void;
  onScriptError?: (error: Event | string) => void;
}

export function PaystackProvider({ 
  children, 
  onScriptLoad,
  onScriptError 
}: PaystackProviderProps) {
  const handleScriptLoad = useCallback(() => {
    console.log('Paystack script loaded successfully');
    onScriptLoad?.();
  }, [onScriptLoad]);

  const handleScriptError = useCallback((error: Event | string) => {
    const errorMessage = typeof error === 'string' ? error : 'Failed to load Paystack script';
    console.error(errorMessage, error);
    onScriptError?.(error);
  }, [onScriptError]);

  useEffect(() => {
    // Skip if already loaded
    if (window.PaystackPop) {
      handleScriptLoad();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => handleScriptLoad();
    script.onerror = (error) => handleScriptError(error);

    document.body.appendChild(script);

    return () => {
      // Only remove if the script is still in the document
      if (script.parentNode === document.body) {
        document.body.removeChild(script);
      }
    };
  }, [handleScriptLoad, handleScriptError]);

  return <>{children}</>;
}

// Export the type for the PaystackPop global
export type { PaystackPopSetupOptions };
