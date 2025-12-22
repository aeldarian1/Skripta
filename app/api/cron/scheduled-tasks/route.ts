import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function refreshStats(supabase: any) {
  console.log('Running refresh-stats...');
  const { data, error } = await supabase.rpc('refresh_user_stats');
  
  if (error) {
    console.error('Error refreshing user stats:', error);
    throw error;
  }
  
  return { task: 'refresh_user_stats', success: true };
}

async function weeklyMaintenance(supabase: any) {
  console.log('Running weekly-maintenance...');
  const { data: results, error } = await supabase.rpc('perform_maintenance_advanced');
  
  if (error) {
    console.error('Error running maintenance:', error);
    throw error;
  }
  
  const totalDuration = results?.reduce((sum: number, r: any) => sum + (r.duration_ms || 0), 0) || 0;
  
  return { 
    task: 'weekly_maintenance', 
    success: true, 
    results,
    totalDurationMs: totalDuration 
  };
}

export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const results: any[] = [];
    
    // Always run daily stats refresh
    const statsResult = await refreshStats(supabase);
    results.push(statsResult);
    
    // Run weekly maintenance on Sundays
    if (dayOfWeek === 0) {
      const maintenanceResult = await weeklyMaintenance(supabase);
      results.push(maintenanceResult);
    }

    return NextResponse.json({
      success: true,
      message: 'Scheduled tasks completed',
      tasksRun: dayOfWeek === 0 ? ['refresh-stats', 'weekly-maintenance'] : ['refresh-stats'],
      results,
      timestamp: now.toISOString()
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
