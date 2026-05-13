import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  // IMPORTANT: do not run any logic between createServerClient and getUser —
  // it must be the first call so the access token can refresh before the
  // protected-route check below runs.
  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected = path === '/profile' || path.startsWith('/profile/')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  if (user && path === '/auth') {
    const url = request.nextUrl.clone()
    url.pathname = '/profile'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}
