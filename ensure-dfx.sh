#!/bin/bash

# Muv In - Permanent DFX Startup Script
# This script ensures DFX is always running correctly for Codespaces

echo "🔧 Starting Muv In Development Environment..."

# Function to check if DFX is responding
check_dfx() {
    dfx canister call muv_in_icp_backend getPlatformStats &>/dev/null
    return $?
}

# Stop any existing DFX processes
echo "   Stopping existing DFX processes..."
dfx stop 2>/dev/null || true
sleep 2

# Start DFX with proper configuration
echo "   Starting DFX with external binding..."
dfx start --background --host 0.0.0.0:4943

# Wait for DFX to be ready
echo "   Waiting for DFX to be ready..."
for i in {1..30}; do
    if check_dfx; then
        echo "   ✅ DFX is running and backend is accessible"
        break
    fi
    sleep 1
    if [ $i -eq 30 ]; then
        echo "   ❌ DFX failed to start properly"
        exit 1
    fi
done

echo " DFX is running successfully!"
echo " Backend accessible at: http://127.0.0.1:4943"
echo " Backend Canister ID: uxrrr-q7777-77774-qaaaq-cai"
echo ""
echo " Your frontend should now connect successfully!"
