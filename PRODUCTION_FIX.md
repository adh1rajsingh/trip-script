# 🚀 Production Deployment Fix

## Issue
The collaboration invitation feature was failing in production with:
> "An error occurred in the Server Components render"

## Root Causes
1. **Missing `NEXT_PUBLIC_APP_URL`** - The invitation link generation couldn't construct the full URL
2. **Node.js `crypto` API** - Using `randomBytes` which might not be available in Edge runtime

## ✅ Fixes Applied

### 1. Updated Token Generation
Changed from Node.js `crypto.randomBytes()` to Web Crypto API which works in all environments:

```typescript
// Old (Node.js only)
const token = randomBytes(32).toString("hex");

// New (Works everywhere)
const tokenBytes = new Uint8Array(32);
crypto.getRandomValues(tokenBytes);
const token = Array.from(tokenBytes)
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');
```

### 2. Fixed URL Generation
Added fallback for production environments:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                'http://localhost:3000';
const inviteLink = `${baseUrl}/invite/${token}`;
```

## 📋 Deployment Checklist

### Step 1: Add Environment Variable to Vercel/Production

Go to your deployment platform and add:

**For Vercel:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add new variable:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://your-domain.vercel.app` (or your custom domain)
   - **Environment:** Production (and Preview if needed)

**For other platforms:**
Add `NEXT_PUBLIC_APP_URL=https://your-production-url.com` to your environment variables

### Step 2: Redeploy

After adding the environment variable:

```bash
# Commit the code changes
git add .
git commit -m "Fix invitation system for production (Web Crypto API + APP_URL)"
git push

# Or trigger a redeploy in your platform's dashboard
```

### Step 3: Verify

1. Go to a trip you own in production
2. Click "Collaborators" → "Invite Collaborator"
3. Enter an email
4. Verify you see the invitation link correctly formatted with your production domain

## 🔍 How to Debug

If you still see errors:

1. **Check the error details in Vercel:**
   - Go to your deployment
   - Click on "Functions" tab
   - Find the error logs for the invitation function

2. **Verify environment variable:**
   ```bash
   # In your deployed app, log this
   console.log('APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
   console.log('VERCEL_URL:', process.env.VERCEL_URL);
   ```

3. **Test the invite endpoint:**
   - Try creating an invitation
   - Check the returned `inviteLink` in the response
   - Make sure it has the correct domain

## 📝 Changes Made

### Modified Files:
- `/src/app/actions/collaborationActions.ts` - Updated token generation and URL handling
- `/.env.local` - Added `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `/.env.example` - Added documentation for `NEXT_PUBLIC_APP_URL`

### What to Set in Production:
```env
NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
```

## 🎯 Expected Behavior After Fix

1. **Invite existing user:** ✅ Works instantly
2. **Invite new user:** ✅ Generates invitation link like:
   - Local: `http://localhost:3000/invite/abc123...`
   - Production: `https://your-domain.com/invite/abc123...`
3. **Copy link:** ✅ User can copy and share
4. **New user signs up:** ✅ Automatically added to trip

## 🔗 Related Files

- Token generation: `/src/app/actions/collaborationActions.ts` (line ~140)
- Invitation page: `/src/app/invite/[token]/page.tsx`
- Client component: `/src/app/invite/[token]/AcceptInviteClient.tsx`

## ⚠️ Important Notes

- The `NEXT_PUBLIC_` prefix makes this variable available on the client side
- Without it, invitation links will fall back to Vercel's auto-generated URL
- Always use HTTPS in production for security

## 🆘 Still Having Issues?

If problems persist after setting `NEXT_PUBLIC_APP_URL`:

1. Check that the `pendingInvitations` table exists in your production database
2. Run the migration if needed: `npm run db:push`
3. Verify Clerk webhooks are working (for user creation)
4. Check Function logs in your deployment platform

---

After deploying, test the feature end-to-end in production! 🚀
