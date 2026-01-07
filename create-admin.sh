#!/bin/bash

# Script to create admin account in production
# Usage: ./create-admin.sh

echo "🔐 Admin Account Creator for Production"
echo "========================================"
echo ""

# Get Railway URL
read -p "Enter your Railway backend URL (e.g., https://xxx.up.railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Railway URL is required"
    exit 1
fi

# Remove trailing slash
RAILWAY_URL=$(echo "$RAILWAY_URL" | sed 's:/*$::')

# Get admin details
read -p "Admin email (default: admin@visibility-report.com): " EMAIL
EMAIL=${EMAIL:-admin@visibility-report.com}

read -p "Admin password (default: Admin123!): " PASSWORD
PASSWORD=${PASSWORD:-Admin123!}

read -p "Admin secret key (default: change-this-secret-key): " SECRET_KEY
SECRET_KEY=${SECRET_KEY:-change-this-secret-key}

echo ""
echo "⏳ Creating admin account..."
echo ""

# Create the admin account
URL="${RAILWAY_URL}/api/auth/create-admin?email=$(echo -n "$EMAIL" | jq -sRr @uri)&password=$(echo -n "$PASSWORD" | jq -sRr @uri)&secret_key=$(echo -n "$SECRET_KEY" | jq -sRr @uri)"

RESPONSE=$(curl -s -X POST "$URL" -H "Content-Type: application/json")

# Check if curl was successful
if [ $? -eq 0 ]; then
    # Check if response contains success message
    if echo "$RESPONSE" | grep -q "successfully\|already exists"; then
        echo "✅ SUCCESS! Admin account created."
        echo ""
        echo "📋 Account Details:"
        echo "   Email: $EMAIL"
        echo "   Password: $PASSWORD"
        echo ""
        echo "🔗 Next Steps:"
        echo "   1. Go to: https://visibility-report.vercel.app/login"
        echo "   2. Login with: $EMAIL / $PASSWORD"
        echo "   3. You'll be redirected to /admin dashboard"
    else
        echo "❌ ERROR: $RESPONSE"
        echo ""
        echo "Possible issues:"
        echo "  - Secret key doesn't match ADMIN_SECRET_KEY in Railway"
        echo "  - Email already exists"
        echo "  - Check Railway logs for errors"
    fi
else
    echo "❌ Connection Error: Cannot connect to Railway backend"
    echo ""
    echo "Possible issues:"
    echo "  - Railway URL is incorrect: $RAILWAY_URL"
    echo "  - Backend is not running"
    echo "  - Check Railway deployment status"
    echo "  - Try visiting: ${RAILWAY_URL}/health"
fi

