#!/bin/bash

echo "🚀 Muv In - Complete Development Setup for Codespaces"
echo "=================================================="

# Function to check if a port is open
check_port() {
    local port=$1
    local host=${2:-"127.0.0.1"}
    if nc -z $host $port 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Step 1: Clean shutdown and restart DFX
echo "🔧 Step 1: Setting up DFX network..."
dfx stop 2>/dev/null || true
sleep 2

# Start DFX with proper host binding
echo "   Starting DFX with external binding..."
dfx start --background --host 0.0.0.0:4943

# Wait for DFX to be ready
echo "   Waiting for DFX to be ready..."
for i in {1..30}; do
    if check_port 4943; then
        echo "   ✅ DFX is running on port 4943"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "   ❌ DFX failed to start properly"
        exit 1
    fi
done

# Step 2: Deploy canisters
echo "🏗️  Step 2: Deploying canisters..."
dfx deploy muv_in_icp_backend
if [ $? -ne 0 ]; then
    echo "❌ Backend deployment failed"
    exit 1
fi

# Step 3: Test backend connectivity
echo "🧪 Step 3: Testing backend connectivity..."
if dfx canister call muv_in_icp_backend getPlatformStats &>/dev/null; then
    echo "   ✅ Backend canister is working correctly"
else
    echo "   ❌ Backend canister test failed"
    exit 1
fi

# Step 4: Setup frontend
echo "📦 Step 4: Setting up frontend..."
cd src/muv_in_icp_frontend

# Install dependencies
echo "   Installing dependencies..."
npm install --silent

# Build frontend
echo "   Building frontend..."
npm run build --silent

# Deploy frontend canister
echo "   Deploying frontend canister..."
cd ../..
dfx deploy muv_in_icp_frontend

# Step 5: Display connection info
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "📍 Access URLs:"
echo "   • Frontend (via canister): http://u6s2n-gx777-77774-qaaba-cai.localhost:4943/"
echo "   • Backend Candid UI: http://127.0.0.1:4943/?canisterId=uzt4z-lp777-77774-qaabq-cai&id=uxrrr-q7777-77774-qaaaq-cai"
echo ""
echo "🔧 Development Server:"
echo "   • To start React dev server: cd src/muv_in_icp_frontend && npm start"
echo "   • Dev server will be at: https://bug-free-space-spoon-gvr49pvv5rj29pv4-3000.app.github.dev"
echo ""
echo "📋 Canister IDs:"
echo "   • Backend: uxrrr-q7777-77774-qaaaq-cai"
echo "   • Frontend: u6s2n-gx777-77774-qaaba-cai"
echo ""
echo "✅ Your Muv In hotel booking platform is ready!"

# Optional: Start development server
read -p "🚀 Start React development server now? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting React development server..."
    cd src/muv_in_icp_frontend
    npm start
fi
