import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { initAuthListener } from './store/authStore';
import { initTheme } from './store/themeStore';
import './styles/globals.css';

// Initialize theme before render to avoid flash
initTheme();

// Start Firebase auth listener
initAuthListener();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'snip-toast',
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color:       'var(--toast-color)',
            border:      '1px solid var(--toast-border)',
            borderRadius: '12px',
            fontFamily:  '"Instrument Sans", sans-serif',
            fontSize:    '14px',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
