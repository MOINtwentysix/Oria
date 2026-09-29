import { ExpoRoot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Metro supplies require.context while bundling Expo Router routes.
// @ts-expect-error Metro extension
const context = require.context('./app');
export default function App() { return <GestureHandlerRootView style={{ flex: 1 }}><ExpoRoot context={context} /></GestureHandlerRootView>; }
