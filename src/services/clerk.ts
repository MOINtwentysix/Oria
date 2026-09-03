import { useEffect, useState } from 'react';
import { User } from '@/types';
import { Platform } from 'react-native';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// Flag to check if we're on the server (for web)
const isServer = typeof window === 'undefined';
declare const window: any;

function createClerkInstance() {
  // On server side for web, return null
  if (Platform.OS === 'web' && isServer) {
    return null;
  }
  
  try {
    // If no publishable key is set, return a mock instance for development
    if (!CLERK_PUBLISHABLE_KEY) {
      return {
        load: () => Promise.resolve(),
        addListener: () => () => {},
        signOut: () => Promise.resolve(),
        session: null,
      };
    }
    
    if (Platform.OS === 'web') {
      const { Clerk } = require('@clerk/clerk-js');
      return new Clerk(CLERK_PUBLISHABLE_KEY);
    }
    
    const { Clerk } = require('@clerk/clerk-expo');
    return new Clerk(CLERK_PUBLISHABLE_KEY);
  } catch {
    return {
      load: () => Promise.resolve(),
      addListener: () => () => {},
      signOut: () => Promise.resolve(),
      session: null,
    };
  }
}

// Get clerk instance - safe for SSR
export function getClerk() {
  if (isServer && Platform.OS === 'web') {
    return null;
  }
  if (!clerkInstance) {
    clerkInstance = createClerkInstance();
  }
  return clerkInstance;
}

// Singleton instance
let clerkInstance: any = null;

// Re-export for backward compatibility
export const clerk = getClerk();

export interface ClerkUser {
  id: string;
  emailAddresses: Array<{ emailAddress: string; verification: { status: string } }>;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
  createdAt: number;
  updatedAt: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<ClerkUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const clerkInstance = getClerk();
    
    // If no clerk instance (SSR), mark as loaded immediately
    if (!clerkInstance) {
      setIsLoaded(true);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = clerkInstance.addListener(({ user: clerkUser }: any) => {
        if (clerkUser) {
          setUser({
            id: clerkUser.id,
            emailAddresses: clerkUser.emailAddresses,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
            username: clerkUser.username,
            createdAt: clerkUser.createdAt,
            updatedAt: clerkUser.updatedAt,
          });
          setIsSignedIn(true);
        } else {
          setUser(null);
          setIsSignedIn(false);
        }
        setIsLoaded(true);
      });
    } catch {
      setIsLoaded(true);
    }

    clerkInstance.load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    const clerkInstance = getClerk();
    if (clerkInstance) {
      await clerkInstance.signOut();
    }
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    clerk: getClerk(),
  };
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const clerkInstance = getClerk();
    if (!clerkInstance) return null;
    const session = await clerkInstance.session?.getToken({ template: 'oria' });
    return session || null;
  } catch {
    return null;
  }
};

export const mapClerkUserToAppUser = (clerkUser: ClerkUser): Partial<User> => {
  return {
    clerk_id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    username: clerkUser.username,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  };
};
