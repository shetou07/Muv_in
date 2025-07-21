#!/bin/bash

# Muv In - Start Development Server (Clean)
# Suppresses deprecation warnings and ensures clean startup

echo "🚀 Starting Muv In Development Server (Clean Mode)..."

# Set Node.js options to suppress warnings
export NODE_OPTIONS="--no-deprecation --no-warnings"

# Ensure DFX is running
echo "🔧 Ensuring DFX is running..."
cd /workspaces/Muv_in
./ensure-dfx.sh

# Start React development server
echo "⚛️  Starting React development server..."
cd src/muv_in_icp_frontend
npm start

echo "🎉 Development server started!"
echo "📍 Access your app at: https://bug-free-space-spoon-gvr49pvv5rj29pv4-3000.app.github.dev"
