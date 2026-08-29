import {
  createContext, useContext, useEffect, useState, useCallback,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type UserRole = 'farmer' | 'village_head' | 'collector' | 'distributor'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
}

interface AuthContextValue {
  session:  Session | null
  user:     User    | null
  profile:  Profile | null
  loading:  boolean
  signIn:          (email: string, password: string) => Promise<{ error: string | null }>
  signUp:          (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>
  signInWithGoogle: (role: UserRole) => Promise<{ error: string | null }>
  signOut:         () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user,    setUser]    = useState<User    | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  /* ── fetch profile (role always comes from DB, never frontend) ─────────── */
  const fetchProfile = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', uid)
      .single()
    if (data) setProfile(data as Profile)
  }, [])

  /* ── bootstrap ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setUser(s?.user ?? null)
      if (s?.user) fetchProfile(s.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) fetchProfile(s.user.id)
        else setProfile(null)
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  /* ── email/password sign in ─────────────────────────────────────────────── */
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  /* ── email/password register — role written to metadata, DB trigger writes profiles ── */
  async function signUp(email: string, password: string, fullName: string, role: UserRole) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,           // picked up by handle_new_user trigger
        },
      },
    })
    return { error: error?.message ?? null }
  }

  /* ── Google OAuth — role passed via state, written to profiles after callback ── */
  async function signInWithGoogle(role: UserRole) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
        // store desired role in state; after callback we'll upsert profiles
        scopes: 'email profile',
      },
    })
    // Save intended role to sessionStorage so callback can write it
    sessionStorage.setItem('circulens_intended_role', role)
    return { error: error?.message ?? null }
  }

  /* ── sign out ────────────────────────────────────────────────────────────── */
  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
    sessionStorage.removeItem('circulens_intended_role')
  }

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      signIn, signUp, signInWithGoogle, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
