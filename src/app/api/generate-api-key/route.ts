import { NextResponse } from 'next/server';
import { verifyPayment } from '@/lib/paystack';
import { prisma } from '@/lib/prisma';
import { generateApiKey } from '@/lib/utils';

interface RequestBody {
  reference: string;
  email: string;
  name?: string;
  password?: string;
}

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { reference, email, name, password } = await req.json() as RequestBody;

    if (!reference || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the payment with Paystack
    const paymentVerified = await verifyPayment(reference);
    
    if (!paymentVerified) {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Check if user already has an API key
    let user = await prisma.user.findUnique({
      where: { email },
      select: { 
        id: true,
        apiKey: true,
        name: true
      }
    });

    let apiKey = user?.apiKey;

    // Generate new API key if user doesn't have one
    if (!apiKey) {
      apiKey = generateApiKey();
      
      // Create a default password if not provided
      const userPassword = password || generateApiKey(); // In a real app, hash this password
      const userName = name || email.split('@')[0];
      
      // Update user with new API key
      await prisma.user.upsert({
        where: { email },
        update: { apiKey },
        create: {
          email,
          name: userName,
          password: userPassword, // In a real app, make sure to hash this password
          apiKey,
        },
      });
    }

    return NextResponse.json({ 
      success: true, 
      apiKey,
      message: 'API key generated successfully' 
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to generate API key',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
