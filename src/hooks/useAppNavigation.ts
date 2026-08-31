import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

const PATH_TO_SCREEN: Record<string, string> = {
  '/explore': 'Explore',
  '/auth': 'Auth',
  '/search': 'Search',
  '/profile': 'Profile',
  '/onboarding': 'Onboarding',
  '/saved': 'Saved',
  '/saved/list': 'SavedList',
  '/ai': 'AI',
  '/ai/plan-list': 'AI',
  '/ai/history': 'AI',
  '/legal/terms': 'Terms',
  '/legal/privacy': 'Privacy',
  '/legal/licenses': 'Licenses',
  '/legal/third-party': 'ThirdParty',
  '/legal/about': 'About',
  '/legal/imprint': 'Imprint',
  '/legal/cookies': 'Cookies',
  '/profile/edit': 'Profile',
  '/profile/security': 'Profile',
  '/profile/interests': 'Profile',
  '/profile/radius': 'Profile',
};

export function useAppNavigation() {
  const navigation = useNavigation<any>();

  const push = useCallback((path: string) => {
    const screen = PATH_TO_SCREEN[path] || path.replace('/', '');
    navigation.navigate(screen);
  }, [navigation]);

  const replace = useCallback((path: string) => {
    const screen = PATH_TO_SCREEN[path] || path.replace('/', '');
    navigation.reset({
      index: 0,
      routes: [{ name: screen }],
    });
  }, [navigation]);

  const back = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const canGoBack = useCallback(() => {
    return navigation.canGoBack();
  }, [navigation]);

  return { push, replace, back, canGoBack };
}
