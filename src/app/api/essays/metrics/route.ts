import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';

function getWeekStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday as start of week
  return d;
}

// Add Essay type for type safety
interface Essay {
  topic: string;
  content: string;
  score?: number;
  type?: string;
  submittedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Fetch all essays for the user (could be optimized for large datasets)
    const essays = await prisma.essay.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    }) as Essay[];

    // Metrics
    const essaysGenerated = essays.length;
    const wordsWritten = essays.reduce((sum: number, e: Essay) => sum + (e.content?.split(/\s+/).length || 0), 0);
    const scoredEssays = essays.filter((e: Essay) => typeof e.score === 'number');
    const averageScore = scoredEssays.length > 0 ? Math.round(scoredEssays.reduce((sum: number, e: Essay) => sum + (e.score || 0), 0) / scoredEssays.length) : 0;

    // Recent Activity (last 5 essays)
    const recentActivity = essays.slice(0, 5).map((e: Essay) => ({
      title: e.topic,
      date: e.submittedAt?.toISOString().slice(0, 10),
      status: e.type || 'Generated',
    }));

    // Trends (essays per month for last 6 months)
    const trends: { month: string, count: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      const count = essays.filter((e: Essay) => {
        const d = new Date(e.submittedAt);
        return d >= monthStart && d <= monthEnd;
      }).length;
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      trends.push({ month: monthLabel, count });
    }

    return NextResponse.json({
      metrics: {
        essaysGenerated,
        wordsWritten,
        averageScore,
      },
      recentActivity,
      trends,
    });
  } catch (error) {
    console.error('Error in /api/essays/metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 