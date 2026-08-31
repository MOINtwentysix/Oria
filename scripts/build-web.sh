#!/bin/bash
export EXPO_ROUTER_DISABLE_RN_NAVIGATION_CHECK=1
export NODE_OPTIONS="--max-old-space-size=4096"
npx expo export -p web
