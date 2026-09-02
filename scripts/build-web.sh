#!/bin/bash
set -e

# Change to the project directory
cd "$(dirname "$0")/.."

# Export environment variables
export EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1
export NODE_OPTIONS="--max-old-space-size=4096"

# Run the build
npx expo export -p web
