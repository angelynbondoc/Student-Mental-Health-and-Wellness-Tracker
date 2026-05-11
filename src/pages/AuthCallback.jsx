import { useEffect } from 'react'
import { supabase } from '../supabase'
import SigningInPage from './SigningInPage/SigningInPage'

export default function AuthCallback() {

  useEffect(() => {
    // Check both query string (?error=...) and hash fragment (#error=...)
    // Supabase sometimes puts errors in the hash, sometimes in the query string
    const queryParams = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))

    const error = queryParams.get('error') || hashParams.get('error')
    const errorDescription = (
      queryParams.get('error_description') ||
      hashParams.get('error_description') ||
      ''
    ).toLowerCase()

    // Supabase rejected server-side — redirect immediately, no React Router needed
    if (error) {
      const isNonNEU =
        errorDescription.includes('neu.edu.ph') ||
        errorDescription.includes('institutional') ||
        errorDescription.includes('permitted')

      window.location.replace(
        isNonNEU
          ? `${window.location.origin}/login?error=non_neu`
          : `${window.location.origin}/login`
      )
      return
    }

    // Happy path — wait for the SIGNED_IN event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          const email = session?.user?.email ?? ''

          if (!email.endsWith('@neu.edu.ph')) {
            await supabase.auth.signOut()
            window.location.replace(`${window.location.origin}/login?error=non_neu`)
            return
          }

          window.location.replace(`${window.location.origin}/home`)
        }

        if (event === 'SIGNED_OUT') {
          window.location.replace(`${window.location.origin}/login`)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return <SigningInPage />
}