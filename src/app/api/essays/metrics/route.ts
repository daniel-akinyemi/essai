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
  score?: number | null;
  type?: string | null;
  submittedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Initialize default values
    const defaultMetrics = {
      essaysGenerated: 0,
      wordsWritten: 0,
      averageScore: 0,
    };

    try {
      // Fetch all essays for the user
      const essays = await prisma.essay.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
      }) as Essay[];

      if (!essays || essays.length === 0) {
        // Return default values if no essays found
        return NextResponse.json({
          metrics: defaultMetrics,
          recentActivity: [],
          trends: [],
        });
      }

      // Calculate metrics
      const essaysGenerated = essays.length;
      const wordsWritten = essays.reduce((sum: number, e: Essay) => 
        sum + (e.content?.split(/\s+/).filter(Boolean).length || 0), 0);
      
      const scoredEssays = essays.filter((e: Essay) => 
        typeof e.score === 'number' && e.score > 0);
      
      const averageScore = scoredEssays.length > 0 
        ? Math.round(scoredEssays.reduce((sum: number, e: Essay) => 
            sum + (e.score || 0), 0) / scoredEssays.length) 
        : 0;

      // Recent Activity (last 5 essays)
      const recentActivity = essays.slice(0, 5).map((e: Essay) => ({
        title: e.topic || 'Untitled Essay',
        date: e.submittedAt?.toISOString()?.slice(0, 10) || new Date().toISOString().slice(0, 10),
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
          try {
            const d = e.submittedAt ? new Date(e.submittedAt) : null;
            return d && d >= monthStart && d <= monthEnd;
          } catch (e) {
            console.error('Error processing essay date:', e);
            return false;
          }
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
      
    } catch (dbError) {
      console.error('Database error in /api/essays/metrics:', dbError);
      // Return default metrics if there's a database error
      return NextResponse.json({
        metrics: defaultMetrics,
        recentActivity: [],
        trends: [],
      });
    }
    
  } catch (error) {
    console.error('Error in /api/essays/metrics:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}