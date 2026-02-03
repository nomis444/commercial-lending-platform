# Authentication Session Persistence Fix

## Problem
Login was succeeding but the session wasn't persisting between pages. Users would be redirected to `/customer` but immediately redirected back to `/login`. The browser console showed multiple warnings about "Multiple GoTrueClient instances detected".

## Root Cause
Multiple Supabase client instances were being created throughout the application:
- `AuthProvider` context in `src/lib/auth/hooks.tsx` created a client
- `PublicHeader` component used `useAuth` hook (creating another client)
- Portal pages used `useAuth` hook (creating more clients)
- Each component was creating its own Supabase client instance

This caused session state conflicts where one client would have the session but others wouldn't, leading to authentication failures.

## Solution
Removed the `AuthProvider` context pattern entirely and switched to direct Supabase client calls in each component, following the pattern that was already working in the customer portal.

### Files Modified

1. **src/components/PublicHeader.tsx**
   - Removed `useAuth` hook
   - Added direct `createClient()` and `auth.getUser()` calls
   - Added local state for user

2. **src/app/(portals)/customer/page.tsx**
   - Already using direct calls (no changes needed)

3. **src/app/(portals)/investor/page.tsx**
   - Removed `useAuth` hook
   - Added `checkUserAndFetchData()` function with direct Supabase calls
   - Simplified auth check logic

4. **src/app/(portals)/admin/page.tsx**
   - Removed `useAuth` hook
   - Added `checkUserAndFetchData()` function with direct Supabase calls
   - Simplified auth check logic

5. **src/components/PortalNavigation.tsx**
   - Removed `useAuth` hook
   - Added direct `createClient()` and `auth.getUser()` calls
   - Added local state for user and role

6. **src/app/apply/page.tsx**
   - Removed `useAuth` hook
   - Added direct `createClient()` and `auth.getUser()` calls
   - Added local state for user

### Files Deleted

1. **src/lib/auth/hooks.tsx** - AuthProvider context that was causing multiple client instances
2. **src/lib/auth/client.ts** - Unused auth client wrapper
3. **src/lib/auth/server.ts** - Unused auth server wrapper
4. **src/lib/auth/types.ts** - Unused auth types
5. **src/app/(portals)/investor-new.tsx** - Temporary file with old imports
6. **src/app/(portals)/investor-temp.tsx** - Temporary file with old imports

## Key Changes

### Before (Problematic Pattern)
```typescript
// Multiple components using AuthProvider
const { user, loading } = useAuth() // Creates Supabase client in context
```

### After (Working Pattern)
```typescript
// Each component makes direct calls when needed
const [user, setUser] = useState<User | null>(null)

async function checkUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  setUser(user)
}
```

## Why This Works

1. **Single Client Instance**: The `createClient()` function in `src/lib/supabase/client.ts` uses `@supabase/ssr` which properly manages browser storage
2. **No Context Overhead**: Removing the AuthProvider eliminates the extra client instance that was created at the app level
3. **Direct Session Access**: Each component directly accesses the session from browser storage via Supabase's built-in mechanisms
4. **Middleware Support**: The middleware in `middleware.ts` continues to refresh sessions on each request

## Testing

Build completed successfully:
```bash
npm run build
✓ Compiled successfully
```

## Next Steps

1. Deploy to Vercel
2. Test login flow on production
3. Verify session persists across page navigation
4. Check that no "Multiple GoTrueClient instances" warnings appear in console

## Notes

- The customer portal was already using this pattern and working correctly
- This fix aligns all components with the same authentication pattern
- Supabase's `@supabase/ssr` package handles session management automatically when using `createClient()` correctly
