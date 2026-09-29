import React from 'react';
import { Stack } from 'expo-router';
import { useFonts } from '@expo-google-fonts/archivo/useFonts';
import { Archivo_400Regular } from '@expo-google-fonts/archivo/400Regular';
import { Archivo_500Medium } from '@expo-google-fonts/archivo/500Medium';
import { Archivo_600SemiBold } from '@expo-google-fonts/archivo/600SemiBold';
import { Archivo_700Bold } from '@expo-google-fonts/archivo/700Bold';
import { Archivo_800ExtraBold } from '@expo-google-fonts/archivo/800ExtraBold';
import { AuthProvider } from '@/services/auth';
export default function Layout() {
  useFonts({ Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold, Archivo_700Bold, Archivo_800ExtraBold });
  return <AuthProvider><Stack screenOptions={{ headerShown: false, animation: 'fade' }} /></AuthProvider>;
}
