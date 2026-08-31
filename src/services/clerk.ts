import { useEffect, useState } from 'react';
import { User } from '@/types';
import { Platform } from 'react-native';

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

function createClerkInstance() {
  try {
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

export const clerk = createClerkInstance();

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
    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = clerk.addListener(({ user: clerkUser }: any) => {
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

    clerk.load()
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
    await clerk.signOut();
  };

  return {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    clerk,
  };
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const session = await clerk.session?.getToken({ template: 'oria' });
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