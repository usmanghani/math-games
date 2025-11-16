# Database Setup Guide

This directory contains database migrations and configuration for the Number Line Adventure game.

## Prerequisites

1. **Supabase Account**: Sign up at [https://supabase.com](https://supabase.com)
2. **Supabase CLI** (optional, for local development):
   ```bash
   npm install -g supabase
   ```

## Quick Setup

### Option 1: Using Supabase Dashboard (Recommended for Production)

1. **Create a new project** in the Supabase dashboard
2. **Go to SQL Editor** in the dashboard
3. **Run migrations in order**:
   - Copy and paste the contents of `migrations/20250114000001_initial_schema.sql`
   - Click "Run" to execute
   - Copy and paste the contents of `migrations/20250114000002_seed_levels.sql`
   - Click "Run" to execute
4. **Get your API credentials**:
   - Go to Settings → API
   - Copy `Project URL` and `anon/public` key
5. **Set environment variables**:
   - In Vercel: Project Settings → Environment Variables
   - Locally: Create `.env.local` (see `.env.example`)

### Option 2: Using Supabase CLI (For Local Development)

1. **Initialize Supabase locally**:
   ```bash
   cd games/number-line-adventure
   supabase init
   ```

2. **Start local Supabase**:
   ```bash
   supabase start
   ```
   This will output local credentials (save these!)

3. **Apply migrations**:
   ```bash
   supabase db reset
   ```

4. **Generate TypeScript types**:
   ```bash
   supabase gen types typescript --local > src/lib/database.types.ts
   ```

5. **Link to your production project** (optional):
   ```bash
   supabase link --project-ref your-project-ref
   ```

## Database Schema Overview

### Tables

1. **profiles** - User display names and avatar emojis
2. **level_definitions** - Static level configurations (10 levels seeded)
3. **user_progress** - Tracks each user's progress through levels
4. **game_sessions** - Detailed session history for analytics

### Security

- Row Level Security (RLS) is enabled on all user data tables
- Users can only access their own data
- `level_definitions` is publicly readable (no RLS)

### Helper Functions

- `initialize_user_progress(user_id)` - Creates progress records for new users
- `unlock_next_level_if_qualified(user_id, level, score)` - Auto-unlocks next level

## Verification

After running migrations, verify the setup:

```sql
-- Check level definitions
SELECT level_number, delta, min_range, max_range
FROM level_definitions
ORDER BY level_number;

-- Should return 10 levels with delta=2,3,4,5,6,7,8,9,10,11
```

## Environment Variables

Required environment variables (set in `.env.local` or Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure `.env.local` exists and contains valid credentials
- Restart your dev server after creating `.env.local`

### Migrations fail to run
- Check that you're running them in order (001 before 002)
- Verify you have proper permissions in Supabase dashboard
- Check SQL Editor for detailed error messages

### RLS policies blocking access
- Verify user is authenticated before accessing data
- Check that `auth.uid()` matches the user_id in queries
- Use Supabase dashboard → Authentication to verify user sessions

## Next Steps

After setting up the database:
1. Test authentication flow (PR #4)
2. Implement profile creation (PR #6)
3. Add progress tracking (PR #7-9)
