import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-register PWA service worker
registerSW({
  onNeedRefresh() {
    console.log('PWA: New content available, reload ready.');
  },
  onOfflineReady() {
    console.log('PWA: App ready to work offline.');
  },
  immediate: true,
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
