// Type definitions for @paystack/inline-js

declare module '@paystack/inline-js' {
  interface PaystackHandler {
    openIframe: () => void;
  }

  interface PaystackPop {
    setup: (options: {
      key: string;
      email: string;
      amount: number;
      text?: string;
      onSuccess: (response: any) => void;
      onClose: () => void;
      [key: string]: any;
    }) => PaystackHandler;
  }

  const PaystackPop: PaystackPop;
  export = PaystackPop;
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
      }) => {
        openIframe: () => void;
      };
    };
  }
}
