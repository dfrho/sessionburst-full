import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { stagehand } from '@/lib/stagehand';
import { generateUtm } from '@/lib/utils/generateUtm';

// Ensure we have a dynamic response
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('==== SESSION POST STARTED ====');
  const response = NextResponse.next();
  
  // Initialize Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
  
  try {
    // Check authentication
    console.log('Checking user authentication...');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User auth check:', user ? `authenticated as ${user.id}` : 'not authenticated');
    
    if (!user) {
      console.log('Authentication failed, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    console.log('Parsing request body...');
    const body = await request.json();
    console.log('Request body actions:', body.actions);
    
    // Ensure UTM params are generated if not provided
    if (!body.options) {
      body.options = {};
    }
    
    if (!body.options.utm_params) {
      body.options.utm_params = generateUtm();
    }
    
    console.log('Environment variables check:');
    console.log('BROWSERBASE_API_KEY exists:', !!process.env.BROWSERBASE_API_KEY);
    console.log('BROWSERBASE_PROJECT_ID exists:', !!process.env.BROWSERBASE_PROJECT_ID);
    console.log('ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
    
    if (!process.env.BROWSERBASE_API_KEY) {
      throw new Error('BROWSERBASE_API_KEY is not set in environment variables');
    }
    
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }
    
    // Create session in Stagehand
    console.log('Creating Stagehand session...');
    const stagehandResponse = await stagehand.createSession(body);
    console.log('Stagehand response:', stagehandResponse);
    
    if (!stagehandResponse?.sessionId) {
      throw new Error('Failed to get sessionId from Stagehand');
    }

    // Validate session ID format
    if (typeof stagehandResponse.sessionId !== 'string' || stagehandResponse.sessionId.length < 8) {
      throw new Error('Invalid session ID format received from Stagehand');
    }

    // Store in Supabase
    console.log('Storing in Supabase...');
    const { data: sessionData, error: supabaseError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        stagehand_session_id: stagehandResponse.sessionId,
        actions: body.actions,
        options: body.options,
        status: 'completed', // Default to completed since we already ran the session
        metadata: stagehandResponse.metadata || {}
      })
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      throw supabaseError;
    }

    console.log('Session created successfully:', sessionData);
    
    return NextResponse.json({ ...stagehandResponse, session: sessionData });
  } catch (error) {
    console.error('Session creation failed with error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        }
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  console.log('User auth check for GET:', user ? `authenticated as ${user.id}` : 'not authenticated');

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse URL search params
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const days = parseInt(url.searchParams.get('days') || '30');
  
  // Calculate date filter if days parameter is provided
  const dateFilter = days > 0 
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString() 
    : null;

  let query = supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id);
    
  // Apply date filter if specified
  if (dateFilter) {
    query = query.gte('created_at', dateFilter);
  }
  
  // Apply limit and sort
  const { data: sessions, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`Returning ${sessions?.length || 0} sessions`);
  return NextResponse.json({ sessions: sessions || [] });
}