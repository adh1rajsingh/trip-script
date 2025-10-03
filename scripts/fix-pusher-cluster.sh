#!/bin/bash

# Pusher Cluster Diagnostic Script

echo "🔍 Pusher Configuration Diagnostic"
echo "===================================="
echo ""

# Read current config
APP_ID=$(grep "PUSHER_APP_ID" .env.local | cut -d '"' -f 2)
APP_KEY=$(grep "NEXT_PUBLIC_PUSHER_KEY" .env.local | cut -d '"' -f 2)
CLUSTER=$(grep "NEXT_PUBLIC_PUSHER_CLUSTER" .env.local | cut -d '"' -f 2)

echo "Current Configuration:"
echo "  App ID: $APP_ID"
echo "  App Key: $APP_KEY"
echo "  Cluster: $CLUSTER"
echo ""

echo "❌ Error Found:"
echo "  Your app key is NOT in the '$CLUSTER' cluster"
echo ""

echo "🔧 To Fix:"
echo "  1. Go to: https://dashboard.pusher.com/apps/$APP_ID/keys"
echo "  2. Look for the 'cluster' field"
echo "  3. Update NEXT_PUBLIC_PUSHER_CLUSTER in .env.local"
echo ""

echo "Common clusters:"
echo "  - mt1  (US - Oregon)"
echo "  - us2  (US East - Virginia)"
echo "  - us3  (US East - Ohio)"
echo "  - eu   (EU - Ireland)"
echo "  - ap1  (Asia Pacific - Singapore)"
echo "  - ap2  (Asia Pacific - Mumbai)"
echo "  - ap3  (Asia Pacific - Tokyo)"
echo "  - ap4  (Asia Pacific - Sydney)"
echo ""

read -p "Press Enter to open your Pusher dashboard..." -n1 -s
if command -v open &> /dev/null; then
    open "https://dashboard.pusher.com/apps/$APP_ID/keys"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://dashboard.pusher.com/apps/$APP_ID/keys"
else
    echo ""
    echo "Please visit: https://dashboard.pusher.com/apps/$APP_ID/keys"
fi

echo ""
echo "After finding your correct cluster, update .env.local:"
echo '  NEXT_PUBLIC_PUSHER_CLUSTER="YOUR_ACTUAL_CLUSTER"'
echo ""
