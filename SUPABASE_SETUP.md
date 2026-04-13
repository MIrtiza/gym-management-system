# Supabase Integration Setup Guide

## 🚨 CRITICAL: gym_id Not Setting? Here's the Fix

If you see this error in the browser console:

```
[ADD_MEMBER] No gym_id found in user metadata
```

### What's the Problem?

The app couldn't find `gym_id` in the user's metadata. This happens when:

- You're using an OLD account created before the fix was applied
- OR the signup/login process didn't properly set the gym_id

### The Solution (AUTOMATIC - Already Applied ✅)

I've updated your auth code to automatically set `gym_id` when:

1. **Signing up** - Creates a gym in the database and stores gym_id in user metadata
2. **Logging in** - If gym_id is missing, fetches it from the database and updates metadata

### What to Do RIGHT NOW:

If you have an existing account that's failing, do this **ONE TIME**:

1. **Log out** from the app
2. **Go to Supabase Dashboard** → Authentication → Users
3. **Find your user** and click on it
4. **Click the three dots (...)** → Edit User
5. **Scroll to "User Metadata" section**
6. **Add your gym as a new record** in the gyms table first (if not done):
   - Go to **SQL Editor** and run:
   ```sql
   INSERT INTO gyms (owner_id, name, status, subscription_plan)
   VALUES ('YOUR_USER_ID_HERE', 'Your Gym Name', 'active', 'free_trial')
   RETURNING id;
   ```

   - Copy the returned `id`
7. **Back in User Edit**, add this metadata:
   ```json
   {
     "gym_id": "PASTE_THE_ID_HERE",
     "gym_name": "Your Gym Name"
   }
   ```
8. **Save** and log back in

OR **Just create a new account** - the signup flow now automatically handles this.

### Verify It's Working:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Log in or create account**
4. **Look for logs:**
   - `[SIGNUP] Gym created with ID: xyz...` OR
   - `[LOGIN] Found gym, updating user metadata with gym_id: xyz...`
5. **Try adding a member** - if you see `[CREATE_MEMBER] Success!` → ✅ Fixed!

---

## Overview

This project uses Supabase for authentication and database management. Supabase provides a PostgreSQL database with built-in authentication, real-time capabilities, and vector search.

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- Node.js and npm installed

## Step 1: Install Dependencies

The Supabase client has already been added to `package.json`. Install dependencies:

```bash
npm install
```

## Step 2: Create a Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Enter project name (e.g., "gym-management")
4. Set a strong database password
5. Select your region
6. Click "Create new project"

## Step 3: Get Your Credentials

Once your project is created:

1. Go to **Project Settings** → **API**
2. Copy your **Project URL** and paste it in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   ```
3. Copy the **anon public** key and paste it:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 4: Enable Authentication

1. In Supabase dashboard, go to **Authentication**
2. Click **Providers**
3. Enable "Email" provider (already enabled by default)
4. Configure email settings if needed

## Step 5: Create Database Tables

Run the following SQL in the Supabase SQL Editor to create required tables:

### Create Gyms Table

```sql
CREATE TABLE IF NOT EXISTS gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_plan VARCHAR(50) DEFAULT 'free_trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(owner_id)
);

-- Create index for faster queries
CREATE INDEX idx_gyms_owner_id ON gyms(owner_id);

-- Enable RLS (Row Level Security)
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can see only their own gym
CREATE POLICY "Users can view their own gym" ON gyms
  FOR SELECT USING (auth.uid() = owner_id);

-- Create policy: Users can update their own gym
CREATE POLICY "Users can update their own gym" ON gyms
  FOR UPDATE USING (auth.uid() = owner_id);

-- Create policy: Users can insert their own gym
CREATE POLICY "Users can insert their own gym" ON gyms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

### Create Members Table (Example)

```sql
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  membership_type VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes
CREATE INDEX idx_members_gym_id ON members(gym_id);
CREATE INDEX idx_members_email ON members(email);

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can see members of their gym
CREATE POLICY "Users can view their gym members" ON members
  FOR SELECT USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

-- Create policy: Users can insert members to their gym
CREATE POLICY "Users can insert members to their gym" ON members
  FOR INSERT WITH CHECK (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

-- Create policy: Users can update members in their gym
CREATE POLICY "Users can update members in their gym" ON members
  FOR UPDATE USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );

-- Create policy: Users can delete members in their gym
CREATE POLICY "Users can delete members in their gym" ON members
  FOR DELETE USING (
    gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
  );
```

## Step 6: Update Environment Variables

Edit `.env.local` and replace placeholder values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

## Step 7: Test the Integration

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/signup
3. Create a new account
4. Check your email for verification link
5. Verify your email
6. Login with your credentials
7. You should be redirected to the dashboard

## File Structure

- `src/lib/supabase.ts` - Supabase client initialization
- `src/lib/auth-service.ts` - Authentication service functions
- `src/lib/auth-context.tsx` - React context for auth state
- `src/app/login/page.tsx` - Login page with Supabase integration
- `src/app/signup/page.tsx` - Signup page with Supabase integration
- `src/app/forgot-password/page.tsx` - Password reset request
- `src/app/reset-password/page.tsx` - Password reset form

## Available Auth Functions

### signupUser(data)

Create a new account with gym details.

```typescript
await signupUser({
  email: "admin@example.com",
  password: "secure-password",
  gymName: "My Gym",
});
```

### loginUser(data)

Login an existing user.

```typescript
await loginUser({
  email: "admin@example.com",
  password: "password",
});
```

### sendPasswordReset(email)

Send password reset email.

```typescript
await sendPasswordReset("admin@example.com");
```

### resetPassword(newPassword)

Reset password with valid token.

```typescript
await resetPassword("new-password");
```

### useAuth()

React hook to access current user and auth status in components.

```typescript
const { user, session, loading, signout } = useAuth();
```

## Security Best Practices

1. ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
2. ✅ Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` for public operations
3. ✅ Enable Row Level Security (RLS) on all tables
4. ✅ Create policies to restrict data access
5. ✅ Use environment variables for sensitive data
6. ✅ Keep `.env.local` in `.gitignore`

## Troubleshooting

### "Missing Supabase environment variables"

- Check `.env.local` has correct URL and key
- Restart dev server after updating env vars

### "Email verification required"

- Check your email for verification link
- Resend verification from Supabase dashboard if needed

### "Invalid login credentials"

- Verify email and password are correct
- Check if account exists
- Try password reset if password is forgotten

### "RLS policies error"

- Run SQL with correct syntax in Supabase SQL Editor
- Ensure tables have RLS enabled
- Check policies for correct conditions

## Next Steps

1. Create database tables for your app
2. Add RLS policies for security
3. Create API routes for server-side operations
4. Integrate payment processing (Stripe, etc.)
5. Set up email templates for auth emails

## 🔍 Debugging: Using Console Logs

The app now includes detailed console logs to help debug member creation and data fetching. These are essential for troubleshooting!

### How to View Console Logs

1. **Open your app** in browser: http://localhost:3000
2. **Press `F12`** to open Developer Tools (or Right-click → Inspect)
3. **Click the "Console" tab** at the top
4. Try adding a member or perform an action
5. **Look for logs starting with `[CREATE_MEMBER]`, `[ADD_MEMBER]`, `[FETCH_MEMBERS]`, `[AUTH_CONTEXT]`**

### What Each Log Tells You

#### `[AUTH_CONTEXT]` Logs

Shows if user is properly authenticated:

```
[AUTH_CONTEXT] Initial session: {...user data...}
[AUTH_CONTEXT] User metadata: { gym_id: "abc123...", gym_name: "My Gym" }
```

**If you see:** User metadata with `gym_id` → ✅ Authentication working
**If you see:** `gym_id: undefined` → ❌ Need to set gym_id in user metadata

#### `[ADD_MEMBER]` Logs

Shows what happens when you click "Add Member":

```
[ADD_MEMBER] handleAddMember called with data: {...}
[ADD_MEMBER] User gym_id: abc123...
[ADD_MEMBER] All validation passed. Creating member with: {...}
[ADD_MEMBER] Member created successfully: {...member data...}
```

**If you see:** "No gym_id found" → ❌ User not properly authenticated
**If you see:** "Email or phone missing" → ❌ Form validation failed
**If you see:** "Success!" → ✅ Member added to Supabase

#### `[CREATE_MEMBER]` Logs

Shows the actual Supabase insert operation:

```
[CREATE_MEMBER] Starting member creation for gym: abc123...
[CREATE_MEMBER] Payload being sent to Supabase: {name: "John", email: "john@gym.com", ...}
[CREATE_MEMBER] Success! Created member: {...}
```

**If you see:** Supabase error → ❌ Database error (see error details)
**If you see:** "Success!" → ✅ Member inserted in Supabase

#### `[FETCH_MEMBERS]` Logs

Shows member list retrieval:

```
[FETCH_MEMBERS] Starting fetch. User gym_id: abc123...
[FETCH_MEMBERS] Got members: [... array of members ...]
[FETCH_MEMBERS] Mapped members: [... mapped UI format ...]
```

**If you see:** Empty array `[]` → Normal on first run
**If you see:** Members array with data → ✅ Successfully fetched from Supabase

### Common Error Messages and Solutions

| Console Error                                    | Cause                                    | Solution                                              |
| ------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------- |
| `No gym_id found in user metadata`               | User not authenticated or gym_id not set | Login with correct account, ensure gym_id in metadata |
| `Supabase error: 42501`                          | RLS policy blocking the operation        | Check RLS policies are created (see Step 5 above)     |
| `Supabase error: 23503`                          | Foreign key constraint violated          | Member's gym_id doesn't match a valid gym in database |
| `Supabase error: Table "members" does not exist` | Members table not created                | Run the SQL from Step 5 in Supabase SQL Editor        |
| `undefined` in User metadata                     | Auth metadata not properly set           | Check Supabase Auth → Users, edit user, set metadata  |

### Step-by-Step Debug Process

1. **Open console (F12)**
2. **Clear previous logs**: Type `clear()` and press Enter
3. **Try adding a member**
4. **Look at console output from top to bottom:**
   - First you should see `[ADD_MEMBER] handleAddMember called`
   - Then `[ADD_MEMBER] User gym_id: ...`
   - Then `[CREATE_MEMBER] Starting member creation...`
   - Then either `[CREATE_MEMBER] Success!` or an error
5. **If you see an error:**
   - Copy the full error message
   - Check the table above for matching error
   - Follow the solution provided

### Example: Successful Member Addition

```
[AUTH_CONTEXT] Initial session: {...}
[ADD_MEMBER] handleAddMember called with data: {fullName: "John Doe", email: "john@gym.com", phone: "555-1234", membershipPlan: "premium"}
[ADD_MEMBER] User gym_id: 550e8400-e29b-41d4-a716-446655440000
[ADD_MEMBER] All validation passed. Creating member with: {gym_id: "550e8400-e29b-41d4-a716-446655440000", name: "John Doe", ...}
[CREATE_MEMBER] Payload being sent to Supabase: {...}
[CREATE_MEMBER] Success! Created member: {id: "123e4567-e89b-12d3-a456-426614174000", name: "John Doe", ...}
[ADD_MEMBER] Member created successfully: {...}
[FETCH_MEMBERS] Starting fetch. User gym_id: 550e8400-e29b-41d4-a716-446655440000
[FETCH_MEMBERS] Got members: [{id: "123e4567-e89b-12d3-a456-426614174000", name: "John Doe", ...}]
```

If you see something like this, everything is working! ✅

## Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Debugging in Browser DevTools](https://developer.chrome.com/docs/devtools/console/)
