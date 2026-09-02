import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/services/clerk';
import { useUIStore } from '@/store';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { onboardingComplete } = useUIStore();

  if (!isLoaded) {
    return null;
  }

  // Redirect to appropriate screen based on auth and onboarding status
  if (isSignedIn && onboardingComplete) {
    return <Redirect href="/explore" />;
  } else if (isSignedIn) {
    return <Redirect href="/onboarding" />;
  } else {
    return <Redirect href="/landing" />;
  }
}
