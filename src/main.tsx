import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {IS_STATIC_DEMO_MODE} from './config/demo';

if ('serviceWorker' in navigator) {
  if (IS_STATIC_DEMO_MODE) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        const scope = new URL(registration.scope);
        const activeScript = registration.active ? new URL(registration.active.scriptURL) : null;
        const isThisApp = scope.pathname === import.meta.env.BASE_URL
          || (scope.pathname === '/' && activeScript?.origin === window.location.origin && activeScript.pathname.endsWith('/sw.js'));
        if (isThisApp) void registration.unregister();
      });
    });
  } else if (window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
    });
  }
}

createRoot(document.getElementById('root')!).render(<App />);
