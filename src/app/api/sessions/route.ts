import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { stagehand } from '@/lib/stagehand'
import { sessionSchema } from '@/lib/validations/session'
import { z } from 'zod'

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
  const response = NextResponse.next()
  
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

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const stagehandResponse = await stagehand.createSession(body)

    return NextResponse.json(stagehandResponse)
  } catch (error) {
    console.error('Session creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
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

export async function GET(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    // Create cache key based on request parameters
    const { searchParams } = new URL(request.url)
    const cacheKey = `sessions-${searchParams.toString()}`

    // Try to get from cache first
    const cache = await caches.open('sessions-cache')
    const cachedResponse = await cache.match(cacheKey)
    
    if (cachedResponse) {
      return cachedResponse
    }

    // If not in cache, fetch from Supabase
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get URL parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    // Build query
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    // Execute query
    const { data: sessions, error, count } = await query

    if (error) throw error

    // Validate sessions data
    const validatedSessions = z.array(sessionSchema).safeParse(sessions)
    if (!validatedSessions.success) {
      console.error('Session validation failed:', validatedSessions.error)
      return NextResponse.json(
        { error: 'Invalid session data' },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      sessions: validatedSessions.data,
      page,
      limit,
      total: count
    })

    // Cache the response with the cacheKey
    await cache.put(cacheKey, response.clone())

    return response

  } catch (error) {
    console.error('Failed to fetch sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
