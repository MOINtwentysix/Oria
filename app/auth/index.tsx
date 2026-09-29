import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Page } from '@/components/ui';
import { useAuth } from '@/services/auth';
import { theme } from '@/core/theme';

export default function Auth() { const { startLogin, signedIn } = useAuth(); const router = useRouter(); const [error, setError] = React.useState(''); const login = async () => { try { await startLogin(); } catch (cause: any) { setError(cause.message || 'M26-Anmeldung fehlgeschlagen.'); } }; if (signedIn) router.replace('/explore'); return <Page><View style={styles.content}><Text style={styles.back} onPress={() => router.back()}>‹</Text><Text style={styles.title}>Mit M26 anmelden</Text><Text style={styles.copy}>Dein M26-Account verbindet gespeicherte Orte und persönliche Empfehlungen auf allen Geräten.</Text>{error ? <Text style={styles.error}>{error}</Text> : null}<Button label="M26 Login öffnen" onPress={login} /><Text style={styles.note}>Mit der Anmeldung akzeptierst du Datenschutz und Nutzungsbedingungen.</Text></View></Page>; }
const styles = StyleSheet.create({ content: { flex: 1, padding: 28, paddingTop: 72, gap: 20 }, back: { color: theme.colors.ink, fontSize: 42, lineHeight: 42 }, title: { color: theme.colors.ink, fontFamily: 'AlbertSans', fontSize: 38, lineHeight: 44, fontWeight: '800' }, copy: { color: theme.colors.muted, fontFamily: 'Almarai', fontSize: 16, lineHeight: 25, marginBottom: 12 }, error: { color: theme.colors.signal, backgroundColor: theme.colors.signalSoft, padding: 14, borderRadius: 10, fontFamily: 'Almarai' }, note: { color: theme.colors.muted, fontFamily: 'Almarai', fontSize: 12, lineHeight: 18, marginTop: 4 } });
