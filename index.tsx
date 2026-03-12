
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for PWA / Offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 'sw.js' or './sw.js' both work, but 'sw.js' is often more robust 
    // for path resolution in nested folder structures during previews.
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
