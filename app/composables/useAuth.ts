import { useRuntimeConfig } from '#imports'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const useAuth = () => {
  const config = useRuntimeConfig()

  if (!client) {
    client = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string
    )
  }

  const supabase = client

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  }

  return { signIn, signOut, getSession }
}