# Admin Dashboard Setup Guide

## Overview

The admin dashboard allows you to:

- View all registered clients
- See summary metrics across all clients
- View individual client dashboards
- Consult clients based on their AI visibility data

## Creating an Admin Account

### Option 1: Using the Python Script (Recommended)

1. Navigate to the backend directory:

```bash
cd backend
```

2. Run the admin creation script:

```bash
python create_admin.py
```

This will create an admin account with:

- Email: `admin@example.com`
- Password: `admin123`
- Company: `Admin`

### Option 2: Custom Admin Account

To create an admin with custom credentials:

```bash
python create_admin.py --email your-admin@email.com --password yourpassword --company "Your Company"
```

### Option 3: Manual Database Entry

If you prefer to create the admin account manually, you can:

1. Register a normal account through the UI
2. Then update the database to set `is_admin = True` for that account

## Accessing the Admin Dashboard

1. Go to the login page: `/login`
2. Login with your admin credentials
3. You'll be automatically redirected to `/admin`

## Admin Dashboard Features

### Main Dashboard (`/admin`)

- **Summary Cards**: Total clients, total AI revenue, total sessions, GA4 connection status
- **Clients Table**: List of all clients with:
  - Company name and email
  - Active/Inactive status
  - GA4 connection status
  - AI sessions, revenue, and conversion rate
  - "View" button to see individual client dashboard

### Client Dashboard View (`/admin/clients/[clientId]`)

- Full dashboard view for any client
- All metrics, charts, and recommendations
- Same view as the client sees, but with admin context
- Use this to consult and provide recommendations

## Security Notes

- Admin accounts have `is_admin = True` in the database
- Only admins can access `/api/admin/*` endpoints
- Admin accounts are filtered out from the client list
- Regular clients cannot access admin routes

## Default Admin Credentials

**⚠️ IMPORTANT: Change these in production!**

- Email: `admin@example.com`
- Password: `admin123`

Change the password immediately after first login or create a new admin account with a secure password.
