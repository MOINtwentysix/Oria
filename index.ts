import { registerRootComponent } from 'expo';
import App from './App';

// Platform-specific entry point
// @ts-ignore - document is available in web, but not in native
if (typeof document !== 'undefined') {
  // Web platform
  // @ts-ignore - dynamic imports work at runtime
  import('react').then(({ default: React }) => {
    // @ts-ignore - dynamic imports work at runtime
    import('react-dom/client').then(({ default: ReactDOM }) => {
      const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
      root.render(React.createElement(App));
    });
  });
} else {
  // Native platforms (iOS, Android, Expo Go)
  registerRootComponent(App);
}
