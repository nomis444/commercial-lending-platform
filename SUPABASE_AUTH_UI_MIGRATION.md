# Supabase Auth UI Migration

## What Changed

We've migrated from custom login/signup forms to **Supabase Auth UI** - the official pre-built authentication interface from Supabase.

## Why This Fixes Everything

1. **No More Multiple Client Instances**: Supabase Auth UI manages the client internally and is designed to work perfectly with Supabase's authentication system
2. **Battle-Tested**: This is the same UI used by thousands of Supabase projects, including your Charleo app
3. **Automatic Session Management**: Handles all session persistence, cookies, and state management automatically
4. **Built-in Features**: Includes password reset, email verification, and more out of the box

## Changes Made

### 1. Installed Packages
```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 2. Updated Login Page (`src/app/(auth)/login/page.tsx`)
- Replaced custom form with `<Auth>` component
- Automatically handles sign in
- Redirects based on user role after successful login

### 3. Updated Signup Page (`src/app/(auth)/signup/page.tsx`)
- Replaced custom form with `<Auth>` component in sign_up view
- Automatically handles account creation
- Redirects based on user role after successful signup

### 4. Kept Previous Fixes
- Singleton pattern in `src/lib/supabase/client.ts`
- Removed `auth.getUser()` from middleware

## How It Works

The Auth UI component:
1. Renders a complete login/signup form
2. Handles all Supabase auth API calls internally
3. Manages session state automatically
4. Triggers `onAuthStateChange` events
5. Our code listens for `SIGNED_IN` event and redirects to appropriate portal

## Testing

1. **Deploy to Vercel**
2. **Clear browser cache** (important!)
3. **Test Login**:
   - Go to `/login`
   - Enter credentials
   - Should see Supabase's styled login form
   - After login, should redirect to portal and STAY there
4. **Test Signup**:
   - Go to `/signup`
   - Create new account
   - Should receive email verification
   - After verification, can log in

## Expected Results

✅ **Success Indicators:**
- Clean, professional login/signup UI
- NO "Multiple GoTrueClient" warnings
- Login redirects to portal and stays there
- Session persists across page refreshes
- User info shows in header

## Customization (Optional)

You can customize the appearance by modifying the `appearance` prop:

```typescript
<Auth
  supabaseClient={supabase}
  appearance={{
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: '#your-brand-color',
          brandAccent: '#your-accent-color',
        },
      },
    },
  }}
  providers={[]}
/>
```

## Note on Role Selection

The current Auth UI doesn't include role selection (borrower/investor). You have two options:

1. **Keep it simple**: Default all new users to 'borrower', let them contact support to become investors
2. **Add custom field**: Use Supabase's metadata fields to add a role selector (requires additional configuration)
3. **Post-signup flow**: After signup, redirect to a role selection page before going to portal

For now, users default to 'borrower' role. Admin accounts must still be created via the `/admin-signup` page.
