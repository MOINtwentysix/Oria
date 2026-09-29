import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { AuthUser } from '@/core/types';

const authorizationUrl = process.env.EXPO_PUBLIC_SSO_AUTHORIZATION_URL || '';
const tokenUrl = process.env.EXPO_PUBLIC_SSO_TOKEN_URL || '';
const userinfoUrl = process.env.EXPO_PUBLIC_SSO_USERINFO_URL || '';
const clientId = process.env.EXPO_PUBLIC_SSO_CLIENT_ID || '';
const webRedirect = process.env.EXPO_PUBLIC_SSO_REDIRECT_URI || '';
const sessionKey = '@oria/m26/session';
const pendingKey = '@oria/m26/pending';

type Pending = { state: string; verifier: string; redirectUri: string };
type AuthContextValue = { user: AuthUser | null; ready: boolean; signedIn: boolean; startLogin: () => Promise<void>; finishLogin: (url: string) => Promise<void>; signOut: () => Promise<void> };
const AuthContext = React.createContext<AuthContextValue | null>(null);
const random = (length = 48) => Array.from(Crypto.getRandomBytes(length), (byte) => byte.toString(16).padStart(2, '0')).join('');
const base64url = (value: string) => value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const redirectUri = () => Platform.OS === 'web' ? webRedirect : Linking.createURL('auth/callback', { scheme: 'oria' });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => { AsyncStorage.getItem(sessionKey).then((raw) => raw && setUser(JSON.parse(raw))).finally(() => setReady(true)); }, []);
  const signOut = async () => { await AsyncStorage.removeItem(sessionKey); await AsyncStorage.removeItem(pendingKey); setUser(null); };
  const finishLogin = async (url: string) => {
    const callback = new URL(url);
    const code = callback.searchParams.get('code');
    const state = callback.searchParams.get('state');
    const raw = await AsyncStorage.getItem(pendingKey);
    if (!code || !state || !raw) throw new Error('Ungültige M26-Anmeldung.');
    const pending = JSON.parse(raw) as Pending;
    if (pending.state !== state) throw new Error('Die M26-Anmeldung konnte nicht bestätigt werden.');
    const tokenResponse = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'authorization_code', client_id: clientId, code, redirect_uri: pending.redirectUri, code_verifier: pending.verifier }).toString() });
    if (!tokenResponse.ok) throw new Error('M26 hat die Anmeldung abgelehnt.');
    const accessToken = (await tokenResponse.json()).access_token;
    const profileResponse = await fetch(userinfoUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!profileResponse.ok) throw new Error('M26-Profil konnte nicht geladen werden.');
    const profile = await profileResponse.json();
    const next = { id: profile.sub || profile.id, email: profile.email || '', firstName: profile.given_name || profile.firstName, lastName: profile.family_name || profile.lastName, imageUrl: profile.picture || profile.imageUrl };
    await AsyncStorage.setItem(sessionKey, JSON.stringify(next)); await AsyncStorage.removeItem(pendingKey); setUser(next);
  };
  const startLogin = async () => {
    if (!authorizationUrl || !tokenUrl || !userinfoUrl || !clientId) throw new Error('Die M26-Login-Konfiguration fehlt.');
    const verifier = random();
    const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, { encoding: Crypto.CryptoEncoding.BASE64 });
    const pending = { state: random(24), verifier, redirectUri: redirectUri() };
    await AsyncStorage.setItem(pendingKey, JSON.stringify(pending));
    const url = `${authorizationUrl}?${new URLSearchParams({ response_type: 'code', client_id: clientId, redirect_uri: pending.redirectUri, scope: 'openid profile email', state: pending.state, code_challenge: base64url(digest), code_challenge_method: 'S256' }).toString()}`;
    if (Platform.OS === 'web') { await Linking.openURL(url); return; }
    const result = await WebBrowser.openAuthSessionAsync(url, pending.redirectUri);
    if (result.type === 'success') await finishLogin(result.url);
  };
  return <AuthContext.Provider value={{ user, ready, signedIn: Boolean(user), startLogin, finishLogin, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => { const context = React.useContext(AuthContext); if (!context) throw new Error('AuthProvider fehlt.'); return context; };
