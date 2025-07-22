import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

// GET: Fetch all essays for the logged-in user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const sort = searchParams.get('sort') || 'date'; // 'date' or 'score'
  let order = searchParams.get('order') || 'desc'; // 'asc' or 'desc'
  if (order !== 'asc' && order !== 'desc') order = 'desc';
  const take = parseInt(searchParams.get('take') || '10', 10);
  const skip = parseInt(searchParams.get('skip') || '0', 10);

  let essays;
  if (id) {
    essays = await prisma.essay.findMany({
      where: { id, userId },
      take: 1,
    });
  } else {
    let orderBy;
    if (sort === 'score') {
      orderBy = { score: order as 'asc' | 'desc' };
    } else {
      orderBy = { submittedAt: order as 'asc' | 'desc' };
    }
    essays = await prisma.essay.findMany({
      where: { userId },
      orderBy,
      take,
      skip,
    });
  }

  return NextResponse.json({ essays });
}

// POST: Create a new essay for the logged-in user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const { topic, content, type, score, feedback } = data;
  if (!topic || !content || !type || typeof score !== 'number' || !feedback) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const essay = await prisma.essay.create({
    data: {
      userId,
      topic,
      content,
      type,
      score,
      feedback,
    },
  });

  return NextResponse.json({ essay });
}

// DELETE: Clear all essays for the logged-in user
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const deletedEssays = await prisma.essay.deleteMany({
      where: { userId },
    });

    return NextResponse.json({ 
      message: 'Essay history cleared successfully',
      deletedCount: deletedEssays.count 
    });
  } catch (error) {
    console.error('Error clearing essay history:', error);
    return NextResponse.json({ error: 'Failed to clear essay history' }, { status: 500 });
  }
} 