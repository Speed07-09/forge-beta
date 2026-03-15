import { redirect } from 'next/navigation'

/**
 * /dashboard → redirects to /home
 * The original light-theme dashboard is preserved in the legacy-app directory.
 * All authenticated users land on /home which contains the unified dark-theme home.
 */
export default function DashboardPage() {
    redirect('/home')
}
