# Supabase Setup Guide

This project has been migrated from MySQL to **Supabase** (PostgreSQL). Follow these steps to set up your Supabase database.

## Why Supabase?

Supabase is a modern, open-source Firebase alternative built on PostgreSQL. Benefits include:

- **Real-time capabilities** - Built-in real-time subscriptions
- **Auto-generated REST API** - Instantly available RESTful API
- **Row Level Security** - Advanced security with PostgreSQL RLS
- **Modern dashboard** - Easy-to-use database management
- **Scalable** - PostgreSQL-backed for production workloads
- **Free tier** - Generous free tier for development

## Setup Steps

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name**: Library Management System
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (for development)
5. Click "Create new project"
6. Wait for the project to be provisioned (usually 1-2 minutes)

### 2. Get Your API Credentials

1. In your Supabase project dashboard, click on "Project Settings" (gear icon)
2. Navigate to "API" section
3. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Set up the Database Schema

1. In your Supabase dashboard, click on "SQL Editor" (left sidebar)
2. Click "New Query"
3. Copy the entire contents of `source/backend/schema-supabase.sql`
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl/Cmd + Enter`
6. Wait for the schema to be created (should see success messages)

### 4. Configure Backend Environment Variables

1. Navigate to `source/backend/`
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Supabase credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   JWT_SECRET=your_random_secret_key
   PORT=5000
   ```

4. Generate a JWT secret (or use any random string):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### 5. Install Dependencies & Start the Server

```bash
cd source/backend
npm install
npm start
```

The server should start on `http://localhost:5000`

## Verify Setup

### Check Database Tables

1. In Supabase dashboard, go to "Table Editor"
2. You should see these tables:
   - `users`
   - `resources`
   - `borrowings`
   - `reservations`
   - `notifications`

### Test the API

1. **Register a new patron:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "password123",
       "first_name": "Test",
       "last_name": "User"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "password": "password123"
     }'
   ```

## Sample Data

The schema includes sample data:
- Sample librarian account (you'll need to set a password)
- Sample patron account
- 4 classic books (The Great Gatsby, To Kill a Mockingbird, 1984, Pride and Prejudice)

## Supabase Dashboard Features

### Row Level Security (RLS)

For production, you may want to enable RLS:

```sql
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrowings ENABLE ROW LEVEL SECURITY;

-- Example: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = user_id);
```

### Real-time Subscriptions

Enable real-time for specific tables:

1. Go to "Database" > "Replication"
2. Enable replication for tables you want real-time updates on
3. In your frontend, you can subscribe to changes:

```javascript
const subscription = supabase
  .from('notifications')
  .on('INSERT', payload => {
    console.log('New notification!', payload.new)
  })
  .subscribe()
```

## Migration from MySQL

### Key Differences

| MySQL | PostgreSQL/Supabase |
|-------|-------------------|
| AUTO_INCREMENT | SERIAL |
| `` backticks | " double quotes |
| LIMIT x, y | LIMIT y OFFSET x |
| NOW() | CURRENT_TIMESTAMP |

### Changed Fields

- `password` → `password_hash` (more descriptive)
- Added `created_at` and `updated_at` timestamps
- Added automatic timestamp updates via triggers

## Troubleshooting

### Connection Issues

- **Error: "Missing Supabase environment variables"**
  - Check your `.env` file exists and has correct values
  - Restart the server after updating `.env`

- **Error: "Invalid API key"**
  - Verify you copied the **anon key**, not the service_role key
  - Check there are no extra spaces in your `.env` file

### Database Issues

- **Error: "relation does not exist"**
  - Run the schema SQL again in Supabase SQL Editor
  - Check all tables were created successfully

- **Error: "violates foreign key constraint"**
  - Ensure related records exist (e.g., user exists before creating borrowing)
  - Check the order of operations in your requests

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- PostgreSQL Docs: https://www.postgresql.org/docs/

## Next Steps

1. Update your frontend `.env` to point to `http://localhost:5000/api`
2. Test all functionality (login, borrow books, manage resources)
3. Explore Supabase dashboard features
4. Consider enabling RLS for production deployment

---

**Note**: Never commit your `.env` file or expose your Supabase credentials publicly!
