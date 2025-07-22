declare module '@paystack/inline-js' {
  interface PaystackInLine {
    newTransaction: (options: {
      key: string;
      email: string;
      amount: number;
      ref?: string;
      metadata?: Record<string, any>;
      callback?: (response: any) => void;
      onClose?: () => void;
      container?: string;
      text?: string;
      plan?: string;
      quantity?: number;
      currency?: string;
      channels?: string[];
      firstname?: string;
      lastname?: string;
      phone?: string | number;
      [key: string]: any;
    }) => any;
  }

  const PaystackButton: PaystackInLine;
  export default PaystackButton;
}
