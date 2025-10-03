#!/bin/bash

# TripScript Collaboration Feature Setup Script
# This script helps you set up the real-time collaboration feature

set -e

echo "🚀 TripScript Collaboration Feature Setup"
echo "=========================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔧 Checking Pusher configuration..."
echo ""

# Check if Pusher variables are set
if grep -q "your_pusher" .env.local 2>/dev/null; then
    echo "⚠️  Pusher credentials not configured!"
    echo ""
    echo "📚 To get your Pusher credentials:"
    echo "   1. Go to https://pusher.com and create a free account"
    echo "   2. Create a new Pusher Channels app"
    echo "   3. Copy the credentials from your app dashboard"
    echo "   4. Update the following variables in .env.local:"
    echo "      - PUSHER_APP_ID"
    echo "      - PUSHER_SECRET"
    echo "      - NEXT_PUBLIC_PUSHER_KEY"
    echo "      - NEXT_PUBLIC_PUSHER_CLUSTER"
    echo ""
    read -p "Press Enter to open Pusher signup page..." -n1 -s
    if command -v open &> /dev/null; then
        open https://dashboard.pusher.com/accounts/sign_up
    elif command -v xdg-open &> /dev/null; then
        xdg-open https://dashboard.pusher.com/accounts/sign_up
    else
        echo ""
        echo "Please visit: https://dashboard.pusher.com/accounts/sign_up"
    fi
    echo ""
    echo "After getting your credentials, run this script again."
    exit 1
else
    echo "✅ Pusher credentials are configured"
fi

echo ""
echo "🗄️  Setting up database..."
echo ""

# Check if drizzle-kit is available
if ! npm list drizzle-kit &> /dev/null; then
    echo "⚠️  drizzle-kit not found. Installing..."
    npm install -D drizzle-kit
fi

# Generate migration
echo "Generating database migration..."
npm run db:generate

echo ""
echo "Pushing migration to database..."
npm run db:push

echo ""
echo "✅ Database setup complete!"
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the development server: npm run dev"
echo "   2. Open a trip and click the collaboration button (bottom right)"
echo "   3. Invite collaborators by email"
echo "   4. Test real-time updates by opening the same trip in multiple browser tabs"
echo ""
echo "📖 For more information, see:"
echo "   - COLLABORATION.md - Feature documentation"
echo "   - IMPLEMENTATION_SUMMARY.md - Technical details"
echo ""
echo "Happy collaborating! 🚀"
