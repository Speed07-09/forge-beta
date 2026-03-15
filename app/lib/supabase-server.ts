import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = 'https://ovuzlhyowzldlffllppq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92dXpsaHlvd3psZGxmZmxscHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjA0OTIsImV4cCI6MjA4NzUzNjQ5Mn0.9Qa_4-FhPy9qk0OymOJnmFuSVvtl8yk4Ob0qja7oBbc'

export async function createSupabaseServerClient() {
    const cookieStore = await cookies()

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                } catch {
                    // The `setAll` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing sessions.
                }
            },
        },
    })
}
