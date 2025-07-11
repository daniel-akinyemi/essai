import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, topic, type = 'Draft' } = await request.json();
    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (content.length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters' }, { status: 400 });
    }

    // Save as draft to database
    const draft = await prisma.essay.create({
      data: {
        userId,
        topic: topic || 'Auto-saved draft',
        content,
        type,
        score: 0,
        feedback: 'Auto-saved draft',
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      draftId: draft.id,
      message: 'Draft auto-saved successfully' 
    });

  } catch (error) {
    console.error('Auto-save error:', error);
    return NextResponse.json({ 
      error: 'Failed to auto-save draft' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session?.user as any)?.id || (session?.user as any)?.sub;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Get recent drafts
    const drafts = await prisma.essay.findMany({
      where: {
        userId,
        type: 'Draft'
      },
      orderBy: {
        submittedAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        topic: true,
        content: true,
        submittedAt: true
      }
    });

    return NextResponse.json({ drafts });

  } catch (error) {
    console.error('Get drafts error:', error);
    return NextResponse.json({ 
      error: 'Failed to get drafts' 
    }, { status: 500 });
  }
} 