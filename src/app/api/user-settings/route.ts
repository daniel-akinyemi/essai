import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-expect-error: userSettings may not be recognized by Prisma types immediately after schema change
    const userSettings = await (prisma as any).userSettings.findUnique({
      where: {
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json(userSettings || {});
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;
    if (!userId && session?.user?.email) {
      // fallback: look up user by email
      const user = await prisma.user.findUnique({ where: { email: session.user.email } });
      userId = user?.id;
    }
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId,
      },
      update: {
        profilePictureUrl: body.profilePictureUrl,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
        showWritingTips: body.showWritingTips,
        theme: body.theme,
        language: body.language,
        autoSaveFrequency: body.autoSaveFrequency,
        writingStyle: body.writingStyle,
        defaultEssayType: body.defaultEssayType,
        essayLength: body.essayLength,
        analyticsEnabled: body.analyticsEnabled,
        dataSharing: body.dataSharing,
        updatedAt: new Date(),
      },
      create: {
        userId,
        profilePictureUrl: body.profilePictureUrl,
        emailNotifications: body.emailNotifications,
        pushNotifications: body.pushNotifications,
        showWritingTips: body.showWritingTips,
        theme: body.theme,
        language: body.language,
        autoSaveFrequency: body.autoSaveFrequency,
        writingStyle: body.writingStyle,
        defaultEssayType: body.defaultEssayType,
        essayLength: body.essayLength,
        analyticsEnabled: body.analyticsEnabled,
        dataSharing: body.dataSharing,
      },
    });

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error('Error saving user settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 