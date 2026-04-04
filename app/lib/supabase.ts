import { createBrowserClient } from '@supabase/ssr'

// Must match middleware / server client so auth cookie names (`sb-<ref>-auth-token`) stay consistent.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://ovuzlhyowzldlffllppq.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92dXpsaHlvd3psZGxmZmxscHBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NjA0OTIsImV4cCI6MjA4NzUzNjQ5Mn0.9Qa_4-FhPy9qk0OymOJnmFuSVvtl8yk4Ob0qja7oBbc'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)