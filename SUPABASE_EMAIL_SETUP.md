# Supabase Email Confirmation Setup

## Issue
Email confirmation links are redirecting to localhost instead of production URL (https://www.midpointaccess.com).

## Solution

### Option 1: Configure Email Redirects (Recommended for Production)

1. **Go to Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard

2. **Configure URL Settings**
   - Go to **Authentication** → **URL Configuration**
   - Set **Site URL** to: `https://www.midpointaccess.com`
   
3. **Add Redirect URLs**
   - Add these URLs to the **Redirect URLs** list:
     - `https://www.midpointaccess.com/**`
     - `https://www.midpointaccess.com/auth/callback`
     - `https://www.midpointaccess.com/customer`

4. **Save Changes**
   - Click **Save** at the bottom of the page

### Option 2: Disable Email Confirmation (Alternative)

Since this is a lending platform where identity verification happens through the loan application process, you may want to disable email confirmation entirely:

1. **Go to Supabase Dashboard**
   - Navigate to **Authentication** → **Providers** → **Email**

2. **Disable Email Confirmation**
   - Toggle off **"Confirm email"**
   - This allows users to sign in immediately without email verification

3. **Save Changes**

## Code Changes Made

The following code changes have been implemented:

1. **Added environment variable** `NEXT_PUBLIC_SITE_URL` to `.env.local`
   - Set to: `https://www.midpointaccess.com`

2. **Updated ApplicationForm.tsx**
   - Now uses `NEXT_PUBLIC_SITE_URL` for email redirects
   - Falls back to `window.location.origin` if not set

3. **Auth callback route** already exists at `/auth/callback`
   - Handles email confirmation tokens
   - Redirects to customer portal after confirmation

## Testing

After configuring Supabase:

1. Submit a new loan application
2. Create a new account at the end
3. Check your email for the confirmation link
4. Click the link - it should redirect to `https://www.midpointaccess.com/auth/callback`
5. You should be automatically redirected to the customer portal

## Troubleshooting

If email confirmation still doesn't work:

1. **Check Supabase logs**
   - Go to **Logs** → **Auth Logs** in Supabase Dashboard
   - Look for any errors related to email sending

2. **Verify environment variables**
   - Make sure `NEXT_PUBLIC_SITE_URL` is set in your production environment (Vercel)
   - Redeploy after adding the environment variable

3. **Check email spam folder**
   - Confirmation emails might be filtered as spam

4. **Verify Supabase email settings**
   - Go to **Authentication** → **Email Templates**
   - Make sure "Confirm signup" template is enabled
