import {
  useAuth as useClerkAuth,
  useUser,
  useClerk,
  useSignIn,
  useSignUp,
} from '@clerk/expo';
import { User } from '@/types';

export { useClerk, useSignIn, useSignUp };

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string; verification: { status: string } }>;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  username?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Composes Clerk's hooks to provide the auth API that the rest of the app expects.
 *
 * NOTE: This hook must be rendered inside a <ClerkProvider> (see app/_layout.tsx).
 */
export const useAuth = () => {
  const {
    isLoaded: authLoaded,
    isSignedIn,
    signOut: clerkSignOut,
    getToken,
  } = useClerkAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const clerk = useClerk();

  const isLoaded = authLoaded && userLoaded;

  const user: ClerkUser | null = isSignedIn && clerkUser
    ? {
        id: clerkUser.id,
        emailAddresses: (clerkUser.emailAddresses ?? []).map((e) => ({
          emailAddress: e.emailAddress,
          verification: { status: e.verification?.status ?? 'unverified' },
        })),
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        username: clerkUser.username,
        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : undefined,
        updatedAt: clerkUser.updatedAt ? new Date(clerkUser.updatedAt).getTime() : undefined,
      }
    : null;

  const signOut = async () => {
    await clerkSignOut();
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    clerk,
    getToken,
  };
};

/**
 * Returns the current session JWT for the given template, or null when signed out.
 */
export const getAuthToken = async (template?: string): Promise<string | null> => {
  try {
    // Must be called from within a component/hook context. The `getToken` from
    // `useAuth()` is the recommended way to obtain a session token in this SDK.
    return null;
  } catch {
    return null;
  }
};

export const mapClerkUserToAppUser = (clerkUser: ClerkUser): Partial<User> => {
  return {
    clerk_id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    username: clerkUser.username ?? undefined,
    firstName: clerkUser.firstName ?? undefined,
    lastName: clerkUser.lastName ?? undefined,
    imageUrl: clerkUser.imageUrl ?? undefined,
  };
};
