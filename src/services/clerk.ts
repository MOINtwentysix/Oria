import { useEffect, useState } from 'react';
import { User } from '@/types';
import { Platform } from 'react-native';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// Singleton Clerk instance for non-Web platforms
let clerkSingleton: any = null;

function createClerkInstance() {
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
      // For web, we need to use Clerk from @clerk/clerk-js
      // But we need to handle SSR properly
      if (typeof window !== 'undefined') {
        const { Clerk } = require('@clerk/clerk-js');
        return new Clerk(CLERK_PUBLISHABLE_KEY);
      }
      return null;
    }
    
    // For native platforms
    if (!clerkSingleton) {
      const { Clerk } = require('@clerk/clerk-expo');
      clerkSingleton = new Clerk(CLERK_PUBLISHABLE_KEY);
    }
    return clerkSingleton;
  } catch {
    return {
      load: () => Promise.resolve(),
      addListener: () => () => {},
      signOut: () => Promise.resolve(),
      session: null,
    };
  }
}

// Get clerk instance - returns null on server for web
function getClerkInstance() {
  if (Platform.OS === 'web' && typeof window === 'undefined') {
    return null;
  }
  if (!clerkSingleton && Platform.OS !== 'web') {
    clerkSingleton = createClerkInstance();
  }
  return clerkSingleton || createClerkInstance();
}

export const clerk = getClerkInstance();

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
    const clerkInstance = getClerkInstance();
    
    // On web, if clerk is null (SSR), set loaded to true immediately
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
    const clerkInstance = getClerkInstance();
    if (clerkInstance) {
      await clerkInstance.signOut();
    }
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    clerk: getClerkInstance(),
  };
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const clerkInstance = getClerkInstance();
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
    first_name: clerkUser.firstName,
    last_name: clerkUser.lastName,
    image_url: clerkUser.imageUrl,
  };
};
