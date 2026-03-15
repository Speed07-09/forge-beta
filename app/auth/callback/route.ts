import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../lib/supabase-server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/home'

    if (code) {
        const supabase = await createSupabaseServerClient()

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', data.user.id)
                .single()

            // Create profile if it doesn't exist (Google OAuth users)
            if (!existingProfile) {
                const emailPrefix = data.user.email?.split('@')[0] ?? 'user'
                await supabase.from('profiles').insert({
                    id: data.user.id,
                    username: emailPrefix,
                    onboarding_completed: false,
                })
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // If code exchange fails, redirect to sign in with error
    return NextResponse.redirect(`${origin}/signin`)
}
