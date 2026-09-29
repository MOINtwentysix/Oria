import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/services/auth';
export default function Layout() { return <AuthProvider><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></AuthProvider>; }
