import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExpoRoot } from 'expo-router';

// @ts-expect-error - Metro provides require.context at bundle time.
const appContext = require.context('./app');

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExpoRoot context={appContext} />
    </GestureHandlerRootView>
  );
}
