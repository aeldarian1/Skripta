import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

    return NextResponse.json({ available: !data });
  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json({ available: null }, { status: 500 });
  }
}
