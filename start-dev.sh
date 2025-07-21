#!/bin/bash

echo "🔧 Fixing DFX connectivity for Codespaces..."

# Stop any existing DFX processes
dfx stop 2>/dev/null || true

# Start DFX with proper host binding for Codespaces
echo "🚀 Starting DFX with host binding..."
dfx start --background --host 0.0.0.0:4943

# Wait for DFX to be ready
sleep 5

# Test DFX connectivity
echo "🧪 Testing DFX connectivity..."
if dfx canister call muv_in_icp_backend getPlatformStats &>/dev/null; then
    echo "✅ Backend canister is accessible"
else
    echo "❌ Backend canister not accessible"
    exit 1
fi

# Update environment for development
echo "⚙️  Updating frontend environment..."
cd src/muv_in_icp_frontend

# Create/update .env file with correct settings
cat > .env << EOF
REACT_APP_CANISTER_ID_MUV_IN_ICP_BACKEND=uxrrr-q7777-77774-qaaaq-cai
REACT_APP_DFX_NETWORK=local
REACT_APP_HOST=http://127.0.0.1:4943
EOF

echo "📦 Installing dependencies..."
npm install --silent

echo "🏗️  Building frontend..."
npm run build --silent

echo "🚀 Starting development server..."
echo "📍 Frontend will be accessible at: https://bug-free-space-spoon-gvr49pvv5rj29pv4-3000.app.github.dev"
echo "🔗 Backend Candid UI: http://127.0.0.1:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai&id=uxrrr-q7777-77774-qaaaq-cai"

# Start the development server
REACT_APP_HOST=http://127.0.0.1:4943 npm start
