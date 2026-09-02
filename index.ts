import { registerRootComponent } from 'expo';
import App from './App';

// Register the root component for native platforms
registerRootComponent(App);

// For web, we need to manually mount the app
if (typeof document !== 'undefined') {
  // @ts-ignore - react-dom/client is available in web environment
  import('react-dom/client').then(({ createRoot }) => {
    // @ts-ignore - React is available in web environment
    import('react').then(({ createElement }) => {
      const root = document.getElementById('root');
      if (root) {
        const reactRoot = createRoot(root);
        reactRoot.render(createElement(App));
      }
    });
  });
}
