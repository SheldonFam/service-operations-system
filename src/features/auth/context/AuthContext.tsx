import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getUserProfile } from '@/lib/supabase-queries'
import { AuthContext } from './auth-context'
import type { User } from '@/lib/types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Track in-flight profile fetch to prevent duplicate requests when
  // multiple auth events fire in quick succession.
  const profileFetchRef = useRef<Promise<void> | null>(null)

  const fetchUserProfile = useCallback(async (userId: string) => {
    // If a fetch is already in-flight, reuse it instead of firing a second one.
    if (profileFetchRef.current) return profileFetchRef.current

    const promise = (async () => {
      const { data, error } = await getUserProfile(userId)
      if (error) {
        console.error('Failed to fetch user profile:', error)
        setProfileError(error)
        setUser(null)
        return
      }
      setProfileError(null)
      setUser(data)
    })()

    profileFetchRef.current = promise
    try {
      await promise
    } finally {
      profileFetchRef.current = null
    }
  }, [])

  useEffect(() => {
    // Supabase's onAuthStateChange fires an `INITIAL_SESSION` event
    // immediately upon subscription, making a separate getSession() call
    // redundant. Relying on the listener alone eliminates the race where
    // both getSession *and* the listener resolve simultaneously and
    // double-fire fetchUserProfile.
    let active = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return

      setSession(session)

      if (session?.user) {
        // Only refetch the profile when the identity actually changes.
        // TOKEN_REFRESHED fires roughly every hour and doesn't change the
        // user — refetching on it is wasted work.
        if (event !== 'TOKEN_REFRESHED') {
          void fetchUserProfile(session.user.id).finally(() => {
            if (active) setLoading(false)
          })
        } else {
          // TOKEN_REFRESHED still means we have a valid session — ensure
          // loading is cleared in case this fires before INITIAL_SESSION.
          if (active) setLoading(false)
        }
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Sign-out failed:', error.message)
    }
    // Always clear local state — even on error the session is likely invalid.
    // The onAuthStateChange listener also fires SIGNED_OUT but clearing here
    // gives immediate UI feedback.
    setUser(null)
    setSession(null)
    setProfileError(null)
  }, [])

  // Memoized so consumers don't re-render on every AuthProvider render.
  // Identity only changes when one of the listed dependencies changes.
  const value = useMemo(
    () => ({
      session,
      user,
      role: user?.role ?? null,
      loading,
      profileError,
      signIn,
      signOut,
    }),
    [session, user, loading, profileError, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
