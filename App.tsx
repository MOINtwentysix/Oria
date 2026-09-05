import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExpoRoot } from 'expo-router';

export default function App() {
  const ctx = require.context('./app');
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ExpoRoot context={ctx} />
    </GestureHandlerRootView>
  );
}
