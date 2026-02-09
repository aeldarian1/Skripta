import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Short cache for email availability checks
const CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=10, stale-while-revalidate=5',
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ available: null }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Email check error:', error);
      return NextResponse.json({ available: null }, { status: 500 });
    }

    return NextResponse.json({ available: !data }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json({ available: null }, { status: 500 });
  }
}
