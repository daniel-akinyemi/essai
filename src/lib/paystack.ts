const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function verifyPayment(reference: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return data.status && data.data.status === 'success';
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}
