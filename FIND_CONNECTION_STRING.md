# 🔍 How to Find Your Supabase Connection String

If you can't find the connection string, here's exactly where to look:

## Method 1: Settings → Database (Recommended)

1. **In your Supabase project dashboard**, look at the **left sidebar**
2. Click on the **⚙️ Settings** icon (gear icon at the bottom)
3. In the settings menu, click **"Database"** (should be near the top)
4. Scroll down to find **"Connection string"** section
5. You'll see tabs: **"URI"**, **"JDBC"**, **"Golang"**, etc.
6. Click on the **"URI"** tab
7. You should see a connection string that starts with `postgresql://`

---

## Method 2: Project Settings → Database

1. Click on your **project name** (top left)
2. Go to **Settings** → **Database**
3. Look for **"Connection string"** or **"Connection pooling"**
4. Click the **"URI"** tab

---

## Method 3: Database → Connection String

1. In the left sidebar, click **"Database"** (not Settings)
2. Look for **"Connection string"** or **"Connection info"**
3. Click on it to expand
4. Select the **"URI"** format

---

## What It Looks Like

The connection string should look like one of these:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

OR

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

## Alternative: Use Connection Pooling

If you see "Connection pooling" instead:

1. Look for **"Session mode"** or **"Transaction mode"**
2. Use the **"Transaction mode"** connection string (port 6543)
3. It should start with `postgresql://postgres.`

---

## Still Can't Find It?

Try this:
1. In your Supabase project, look for **"Project Settings"** or **"API Settings"**
2. Or check the **"Database"** section in the main dashboard
3. Look for any section that says **"Connection"**, **"Database URL"**, or **"PostgreSQL connection"**

---

## Quick Alternative: Use the Direct Database URL

If you still can't find it, you can construct it manually:

1. Go to **Settings** → **General**
2. Find your **Project Reference ID** (looks like: `abcdefghijklmnop`)
3. You created a **database password** when setting up the project
4. Your connection string format is:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

Replace:
- `[YOUR-PASSWORD]` with your database password
- `[PROJECT-REF]` with your project reference ID

---

## Need More Help?

Tell me:
1. What do you see when you click Settings → Database?
2. What tabs or sections are visible?
3. Are you on the Supabase dashboard for your project?

I can guide you through the exact steps based on what you're seeing!

