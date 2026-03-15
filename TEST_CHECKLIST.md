# Forge – Authentication Flow Test Checklist

Use this checklist after running `npm run dev` to manually verify the complete auth flow.

---

## 🏠 Landing Page

- [ ] Landing page loads at `http://localhost:3000`
- [ ] Animated wave background is visible
- [ ] "Get Started" button navigates to `/onboarding`
- [ ] "Already have an account? Sign in" link works → `/signin`
- [ ] Authenticated users visiting `/` are redirected to `/home`

---

## 🚀 Onboarding

- [ ] `/onboarding` loads with black background
- [ ] Screen 1 shows "Build Lasting Habits" with circle animation
- [ ] Screen 2 shows "Track Your Progress" with wave animation
- [ ] Screen 3 shows "Transform in 30 Days" with geometric animation
- [ ] Swipe left/right gesture works on mobile
- [ ] Dot indicators update per screen
- [ ] "Continue" advances to next screen
- [ ] "Skip" (screens 1-2) navigates to `/signin`
- [ ] "Sign In" button on screen 3 navigates to `/signin`
- [ ] Authenticated users visiting `/onboarding` are redirected to `/home`

---

## 🔐 Sign In Page (`/signin`)

- [ ] Page has dark background (`#000`)
- [ ] Animated wave background is visible
- [ ] Heading "FORGE" displayed in large light tracking
- [ ] Email and password inputs have dark borders, transparent bg, white text
- [ ] Focus on input highlights border to white
- [ ] "Sign In" button is white with rounded-full style
- [ ] Clicking "Sign In" with empty fields shows error message in red
- [ ] Invalid credentials show error: "Invalid email or password"
- [ ] During loading, button shows three-dot animation
- [ ] "Continue with Google" button shows Google logo
- [ ] Google OAuth flow initiates (redirects to Google)
- [ ] "Sign Up" link navigates to `/signup`
- [ ] Already-authenticated users visiting `/signin` are redirected to `/home`

---

## 📝 Sign Up Page (`/signup`)

- [ ] Page matches sign in design system (dark, wave bg, same button styles)
- [ ] Three fields: Username, Email, Password
- [ ] Password strength meter appears when typing (dark bars)
- [ ] Strength labels: Very Weak → Very Strong
- [ ] "Create Account" button styled as primary (white, rounded-full)
- [ ] "Continue with Google" button shows Google logo
- [ ] Validation errors display in red
- [ ] Successful sign-up creates user + profile row in Supabase, redirects to `/home`
- [ ] "Sign In" link navigates to `/signin`

---

## 🔒 Protected Routes

| Route | Unauthenticated | Authenticated |
|-------|----------------|---------------|
| `/home` | Redirects → `/signin` | Shows home content |
| `/tracker` | Redirects → `/signin` | Shows tracker page |
| `/plans` | Redirects → `/signin` | Shows plans page |
| `/settings` | Redirects → `/signin` | Shows settings page |
| `/dashboard` | Redirects → `/signin` (via /home) | Redirects → `/home` |

---

## 🏡 Home Page (`/home`)

- [ ] Dark background, white text
- [ ] Shows user's email prefix as greeting
- [ ] Navigation cards for Tracker, Plans, Settings
- [ ] "Sign out" button in header
- [ ] Cards animate in on page load

---

## 🔑 Auth State

- [ ] After email sign-in → redirects to `/home`
- [ ] After Google sign-in → redirects to `/home` (via `/auth/callback`)
- [ ] After sign-out → redirects to `/signin`
- [ ] Session persists on page refresh
- [ ] Signing out in one tab signs out all tabs (auth state change listener)

---

## 📱 Mobile Responsiveness

- [ ] Landing page centered on small screens
- [ ] Onboarding swipe gestures work on touch devices
- [ ] Auth forms usable on mobile (no horizontal scroll)
- [ ] All tap targets are at least 48px tall
- [ ] Home nav cards display correctly on small screens

---

## ♿ Accessibility

- [ ] All inputs have `id` + `htmlFor` label pairs
- [ ] Buttons have `aria-label` attributes
- [ ] Error messages use `role="alert"` + `aria-live="polite"`
- [ ] Page navigable by keyboard (Tab, Enter)
- [ ] Loading dots have `aria-label="Loading"`

---

## 🛠 Build

- [ ] `npm run build` completes with 0 TypeScript errors
- [ ] `npm run build` completes with 0 import errors
- [ ] No 404 errors on any navigation path
