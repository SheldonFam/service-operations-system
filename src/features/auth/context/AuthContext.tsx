import { useEffect, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getUserProfile } from '@/lib/supabase-queries'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setSessionLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id ?? null

  const {
    data: user = null,
    error: profileQueryError,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      const { data, error } = await getUserProfile(userId!)
      if (error) throw new Error(error)
      return data
    },
    enabled: !!userId,
  })

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Sign-out failed:', error.message)
    setSession(null)
    queryClient.removeQueries({ queryKey: ['user-profile'] })
  }, [queryClient])

  const value = useMemo(
    () => ({
      session,
      user,
      role: user?.role ?? null,
      loading: sessionLoading || (!!userId && profileLoading),
      profileError: profileQueryError?.message ?? null,
      signIn,
      signOut,
    }),
    [session, user, sessionLoading, userId, profileLoading, profileQueryError, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
