import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (e: any) {
    console.error('Critical mount error:', e);
    rootElement.innerHTML = `
      <div style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #020617; color: #f8fafc; font-family: sans-serif; padding: 20px; text-align: center;">
        <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6, #6366f1); display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 16px;">X</div>
        <h2 style="margin: 0 0 8px 0; font-size: 20px;">ERROREN X</h2>
        <p style="color: #94a3b8; max-width: 400px; font-size: 14px; margin-bottom: 16px;">Application encountered a mount error. Click below to reset and launch.</p>
        <button onclick="localStorage.clear(); window.location.reload();" style="padding: 10px 20px; background: #8b5cf6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          Reset & Launch Workspace
        </button>
      </div>
    `;
  }
}

