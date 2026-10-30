import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '../hooks/use-color-scheme';
import { tokenCache, CLERK_PUBLISHABLE_KEY } from '../services/clerk';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // If a valid key exists, wrap with ClerkProvider; otherwise render app directly so it works offline/in dev without errors
  if (CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.trim() !== '') {
    return (
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Slot />
        </ThemeProvider>
      </ClerkProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </ThemeProvider>
  );
}
