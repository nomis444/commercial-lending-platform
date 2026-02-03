# Authentication Fix - Testing Guide

## Changes Made

### 1. Singleton Pattern in Browser Client
**File**: `src/lib/supabase/client.ts`
- Now caches the Supabase client instance
- Only creates ONE instance across the entire app
- All subsequent calls return the same instance

### 2. Removed Auth Call from Middleware
**File**: `src/lib/supabase/middleware.ts`
- Removed `await supabase.auth.getUser()` call
- This was creating server-side auth clients on EVERY request
- Middleware now only handles cookie management
- Auth validation happens in page components

## Testing Steps

1. **Clear Browser Cache**
   - Open DevTools (F12)
   - Go to Application tab
   - Clear all storage (cookies, localStorage, sessionStorage)
   - Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

2. **Test Login**
   - Go to `/login`
   - Enter credentials
   - Click "Sign in"
   - Should redirect to `/customer` (or appropriate portal)
   - Should STAY on the portal page (not redirect back to login)

3. **Check Console**
   - Open DevTools Console
   - Should see NO "Multiple GoTrueClient instances" warnings
   - If you still see warnings, note how many (should be much fewer)

4. **Test Session Persistence**
   - After logging in successfully
   - Navigate to different pages
   - Refresh the page
   - Should remain logged in

5. **Check Browser Storage**
   - Open DevTools > Application > Local Storage
   - Look for keys starting with `sb-spznjpzxpssxvgcksgxh-auth-token`
   - Should see the auth token stored

## Expected Results

✅ **Success Indicators:**
- No "Multiple GoTrueClient" warnings in console
- Login redirects to portal and stays there
- Session persists across page refreshes
- User info shows in header

❌ **If Still Failing:**
- Check if you're seeing the warnings
- Check if session token exists in localStorage
- Try logging in with the browser console open to see exact errors

## Alternative: Use Supabase Auth UI

If the custom login continues to have issues, we can switch to Supabase's pre-built Auth UI (like Charleo uses):

```bash
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

This would eliminate all client management issues since it's handled internally by Supabase.
