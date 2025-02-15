import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { StagehandClient } from '@/lib/stagehand'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Define cache configuration
// export const runtime = 'edge' // Optional: Use edge runtime for better performance
export const revalidate = 30 // Revalidate cache every 30 seconds

// Helper function to invalidate cache
async function invalidateSessionsCache() {
  const cache = await caches.open('sessions-cache')
  const keys = await cache.keys()
  // Delete all cached sessions
  await Promise.all(keys.map(key => cache.delete(key)))
}

export async function POST(request: NextRequest) {
  console.log('Session POST started'); // Debug point 1
  const response = NextResponse.next()
  
  // Replace Supabase client initialization
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
  
  // Initialize Stagehand client with API key
  const stagehand = new StagehandClient({
    apiKey: process.env.BROWSERBASE_API_KEY!
  });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User auth check:', user ? 'authenticated' : 'not authenticated'); // Debug point 4
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body); // Debug point 5
    
    // Create session in Stagehand first
    console.log('Creating Stagehand session...'); // Debug point 6
    const stagehandResponse = await stagehand.createSession(body)
    console.log('Stagehand response:', stagehandResponse); // Debug point 7
    
    if (!stagehandResponse?.sessionId) {
      throw new Error('Failed to get sessionId from Stagehand')
    }

    // Only if Stagehand succeeds, store in Supabase
    console.log('Storing in Supabase...'); // Debug point 8
    const { data: sessionData, error: supabaseError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        stagehand_session_id: stagehandResponse.sessionId,
        actions: body.actions,
        options: body.options,
        status: 'running'
      })
      .select()
      .single()

    if (supabaseError) {
      console.error('Supabase error:', supabaseError); // Debug point 9
      throw supabaseError
    }

    console.log('Session created successfully:', sessionData); // Debug point 10
    return NextResponse.json({ ...stagehandResponse, session: sessionData })
  } catch (error) {
    console.error('Session creation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    )
  }
}

// Add endpoint to update replay data
export async function PUT(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, replay, replayUrl } = body

    const { error } = await supabase
      .from('sessions')
      .update({
        replay,
        replay_url: replayUrl,
        status: 'completed'
      })
      .eq('stagehand_session_id', sessionId)
      .eq('user_id', session.user.id)

    if (error) {
      throw error
    }

    // Invalidate cache after updating session
    await invalidateSessionsCache()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update replay:', error)
    return NextResponse.json(
      { error: 'Failed to update replay' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        }
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ sessions: sessions || [] })
}
