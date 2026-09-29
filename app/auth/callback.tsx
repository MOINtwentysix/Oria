import React from 'react';
import { Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useAuth } from '@/services/auth';
export default function Callback() { const router = useRouter(); const { finishLogin } = useAuth(); React.useEffect(() => { Linking.getInitialURL().then((url) => finishLogin(url || '').then(() => router.replace('/explore')).catch(() => router.replace('/auth'))); }, []); return <View><Text>Anmeldung wird abgeschlossen …</Text></View>; }
