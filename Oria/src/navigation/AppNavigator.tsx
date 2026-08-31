import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/services/clerk';
import { useUIStore } from '@/store';
import { ExploreScreen } from '@/screens/explore/ExploreScreen';
import { SearchScreen } from '@/screens/explore/SearchScreen';
import { SavedScreen } from '@/screens/saved/SavedScreen';
import { SavedListScreen } from '@/screens/saved/SavedListScreen';
import { AIScreen } from '@/screens/ai/AIScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { AuthScreen } from '@/screens/auth/AuthScreen';
import { LandingPage } from '@/screens/landing/LandingPage';
import { PrivacyPolicyScreen, TermsOfServiceScreen, ImprintScreen, CookiePolicyScreen, OpenSourceLicensesScreen, ThirdPartyServicesScreen, AboutScreen } from '@/screens/legal/LegalScreens';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { queryClient } from '@/services/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { onboardingComplete } = useUIStore();

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              cardStyle: { backgroundColor: 'transparent' },
              cardOverlayEnabled: true,
            }}
          >
            {/* Public screens */}
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Privacy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="Terms" component={TermsOfServiceScreen} />
            <Stack.Screen name="Imprint" component={ImprintScreen} />
            <Stack.Screen name="Cookies" component={CookiePolicyScreen} />
            <Stack.Screen name="Licenses" component={OpenSourceLicensesScreen} />
            <Stack.Screen name="ThirdParty" component={ThirdPartyServicesScreen} />
            <Stack.Screen name="About" component={AboutScreen} />

            {/* Protected screens */}
            {isSignedIn && onboardingComplete ? (
              <>
                <Stack.Screen name="Explore" component={ExploreScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="Saved" component={SavedScreen} />
                <Stack.Screen name="SavedList" component={SavedListScreen} />
                <Stack.Screen name="AI" component={AIScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </>
            ) : isSignedIn ? (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            ) : (
              <Stack.Screen name="Landing" component={LandingPage} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F9FC',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});