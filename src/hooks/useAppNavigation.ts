import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export function useAppNavigation() {
  const router = useRouter();

  const push = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const replace = useCallback((path: string) => {
    router.replace(path);
  }, [router]);

  const back = useCallback(() => {
    router.back();
  }, [router]);

  const canGoBack = useCallback(() => {
    return router.canGoBack();
  }, [router]);

  return { push, replace, back, canGoBack };
}
