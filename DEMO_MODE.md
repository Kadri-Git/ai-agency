# Demo Mode Guide

## Quick Start with Demo Mode

Demo mode allows you to test the application without setting up Google Analytics 4 credentials. It uses realistic mock data.

### Option 1: Quick Demo Login

1. Go to `http://localhost:3000/login`
2. Click the **"Try Demo Mode (No Setup Required)"** button
3. You'll be automatically logged in with a demo account
4. The dashboard will show mock data

**Demo Credentials:**

- Email: `demo@example.com`
- Password: `demo123`

### Option 2: Register with Demo Mode

1. Go to `http://localhost:3000/register`
2. Check the **"Use Demo Mode"** checkbox
3. Fill in:
   - Email: `your-email@example.com`
   - Password: `your-password`
   - Company Name: `Your Company`
4. **Skip** GA4 Property ID and Service Account JSON fields
5. Click **Register**

### What You'll See

In demo mode, the dashboard shows:

- **AI Sessions**: Random between 50-300
- **AI Revenue**: Random between $500-$3,000
- **AI Conversion Rate**: Calculated from sessions and conversions
- **AI Average Order Value**: Calculated from revenue and conversions
- **AI Revenue per Session**: Calculated metric
- **Site Average Conversion Rate**: Random between 1-5%
- **AI vs Site Conversion Rate**: Comparison metric
- **Revenue Trend**: 30 days of mock revenue data
- **Top Landing Pages**: 5 mock landing pages with sessions and revenue

### Switching to Real Data

To use real GA4 data:

1. Logout
2. Register a new account **without** checking "Demo Mode"
3. Provide your real GA4 Property ID and Service Account JSON
4. You'll see live data from your Google Analytics account

### Notes

- Demo mode data is randomly generated and changes on each page refresh
- Demo accounts are stored in the database but don't require GA4 credentials
- You can have multiple demo accounts with different emails
- Demo mode is indicated by a banner at the top of the dashboard
