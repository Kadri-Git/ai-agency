#!/bin/bash

# Script to update an existing account to admin
# Usage: ./update-to-admin.sh YOUR_EMAIL YOUR_PASSWORD

echo "🔐 Update Account to Admin"
echo "=========================="
echo ""

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./update-to-admin.sh YOUR_EMAIL YOUR_PASSWORD"
    echo ""
    echo "Example:"
    echo "  ./update-to-admin.sh your-email@example.com YourPassword123!"
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"
RAILWAY_URL="https://ai-agency-production-12a5.up.railway.app"
SECRET_KEY="change-this-secret-key"

echo "Updating account: $EMAIL"
echo ""

URL="${RAILWAY_URL}/api/auth/create-admin?email=$(echo -n "$EMAIL" | jq -sRr @uri)&password=$(echo -n "$PASSWORD" | jq -sRr @uri)&secret_key=$(echo -n "$SECRET_KEY" | jq -sRr @uri)"

RESPONSE=$(curl -s -X POST "$URL" -H "Content-Type: application/json")

if [ $? -eq 0 ]; then
    if echo "$RESPONSE" | grep -q "Updated\|successfully\|already exists"; then
        echo "✅ SUCCESS! Account updated to admin."
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
    fi
else
    echo "❌ Connection Error: Cannot connect to Railway backend"
fi

