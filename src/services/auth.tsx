import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { AppState, Platform } from 'react-native';
import { User } from '@/types';
import { apiClient } from '@/services/api';

const AUTHORIZATION_URL = process.env.EXPO_PUBLIC_SSO_AUTHORIZATION_URL || '';
const TOKEN_URL = process.env.EXPO_PUBLIC_SSO_TOKEN_URL || '';
const USERINFO_URL = process.env.EXPO_PUBLIC_SSO_USERINFO_URL || '';
const CLIENT_ID = process.env.EXPO_PUBLIC_SSO_CLIENT_ID || '';
const WEB_REDIRECT_URI = process.env.EXPO_PUBLIC_SSO_REDIRECT_URI || '';
const TOKEN_STORAGE_KEY = '@oria_sso_token';
const USER_STORAGE_KEY = '@oria_sso_user';
const PENDING_AUTH_KEY = '@oria_sso_pending';

export interface AuthUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  username?: string | null;
}

interface PendingAuth {
  state: string;
  verifier: string;
  redirectUri: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function randomString(length = 64) {
  const bytes = Crypto.getRandomBytes(length);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function toBase64Url(value: string) {
  return value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createPkcePair() {
  const verifier = randomString();
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
  return { verifier, challenge: toBase64Url(digest) };
}

function getRedirectUri() {
  if (Platform.OS === 'web') return WEB_REDIRECT_URI;
  return Linking.createURL('auth/callback', { scheme: 'oria' });
}

function mapUser(data: any): AuthUser {
  return {
    id: data.sub || data.id,
    emailAddresses: data.email
      ? [{ emailAddress: data.email }]
      : (data.emailAddresses || []).map((entry: any) => ({ emailAddress: entry.email || entry.emailAddress })),
    firstName: data.given_name || data.firstName || null,
    lastName: data.family_name || data.lastName || null,
    imageUrl: data.picture || data.imageUrl || null,
    username: data.preferred_username || data.username || null,
  };
}

async function exchangeCode(code: string, pending: PendingAuth) {
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: pending.redirectUri,
      code_verifier: pending.verifier,
    }).toString(),
  });
  if (!response.ok) throw new Error(`SSO token exchange failed (${response.status})`);
  const tokenData = await response.json();
  const token = tokenData.access_token as string;
  if (!token) throw new Error('SSO response did not contain an access token');
  const userResponse = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!userResponse.ok) throw new Error(`SSO user info failed (${userResponse.status})`);
  const user = mapUser(await userResponse.json());
  await AsyncStorage.setMany({
    [TOKEN_STORAGE_KEY]: token,
    [USER_STORAGE_KEY]: JSON.stringify(user),
  });
  await apiClient.setToken(token);
  return { token, user };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const loadStoredSession = React.useCallback(async () => {
    try {
      const entries = await AsyncStorage.getMany([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
      const storedToken = entries[TOKEN_STORAGE_KEY];
      const storedUser = entries[USER_STORAGE_KEY];
      setToken(storedToken);
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch {
      await AsyncStorage.removeMany([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);
    loadStoredSession();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadStoredSession();
    });
    return () => {
      clearTimeout(loadingTimeout);
      subscription.remove();
    };
  }, [loadStoredSession]);

  const signOut = React.useCallback(async () => {
    await AsyncStorage.removeMany([TOKEN_STORAGE_KEY, USER_STORAGE_KEY, PENDING_AUTH_KEY]);
    await apiClient.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const getToken = React.useCallback(async () => token, [token]);

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn: Boolean(token && user), signOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export function useSSO() {
  const flowInProgress = React.useRef(false);

  const startSSOFlow = React.useCallback(async () => {
    if (flowInProgress.current) return;
    flowInProgress.current = true;

    if (!AUTHORIZATION_URL || !TOKEN_URL || !USERINFO_URL || !CLIENT_ID) {
      flowInProgress.current = false;
      throw new Error('SSO configuration is incomplete');
    }
    try {
      const redirectUri = getRedirectUri();
      const { verifier, challenge } = await createPkcePair();
      const state = randomString(32);
      await AsyncStorage.setItem(PENDING_AUTH_KEY, JSON.stringify({ state, verifier, redirectUri }));
      const url = `${AUTHORIZATION_URL}?${new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        redirect_uri: redirectUri,
        scope: 'openid profile email',
        state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      }).toString()}`;

      if (Platform.OS === 'web') {
        window.location.assign(url);
        return;
      }
      const result = await WebBrowser.openAuthSessionAsync(url, redirectUri);
      if (result.type === 'success' && result.url) {
        await completeSSO(result.url);
      } else if (result.type === 'cancel') {
        throw new Error('SSO login was cancelled');
      }
    } finally {
      flowInProgress.current = false;
    }
  }, []);

  return { startSSOFlow };
}

export async function completeSSO(callbackUrl: string) {
  const callback = new URL(callbackUrl);
  const error = callback.searchParams.get('error');
  if (error) throw new Error(callback.searchParams.get('error_description') || error);
  const code = callback.searchParams.get('code');
  const state = callback.searchParams.get('state');
  const pendingJson = await AsyncStorage.getItem(PENDING_AUTH_KEY);
  if (!code || !state || !pendingJson) throw new Error('Invalid SSO callback');
  const pending = JSON.parse(pendingJson) as PendingAuth;
  if (state !== pending.state) throw new Error('Invalid SSO state');
  const result = await exchangeCode(code, pending);
  await AsyncStorage.removeItem(PENDING_AUTH_KEY);
  return result;
}

export const mapUserToAppUser = (authUser: AuthUser): Partial<User> => ({
  account_id: authUser.id,
  email: authUser.emailAddresses[0]?.emailAddress || '',
  username: authUser.username ?? undefined,
  firstName: authUser.firstName ?? undefined,
  lastName: authUser.lastName ?? undefined,
  imageUrl: authUser.imageUrl ?? undefined,
});
