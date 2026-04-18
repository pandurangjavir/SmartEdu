import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#ffffff',
            color: '#1f2937',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #f3f4f6',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '-0.01em'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
            style: { borderLeft: '4px solid #10b981' }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
            style: { borderLeft: '4px solid #ef4444' }
          },
        }}
      />
    </AuthProvider>
  </React.StrictMode>
); 