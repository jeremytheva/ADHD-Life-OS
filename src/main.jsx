import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import AppErrorBoundary from './components/common/AppErrorBoundary.jsx';
import { AccessibilityPreferencesProvider } from './contexts/AccessibilityPreferencesContext.jsx';
import { initializeAccessibilityPreferences } from './services/accessibilityPreferences';
import './index.css';

const initialAccessibilityPreferences = initializeAccessibilityPreferences()

createRoot(document.getElementById('root')).render(
<StrictMode>
    <AppErrorBoundary>
        <AccessibilityPreferencesProvider initialPreferences={initialAccessibilityPreferences}>
            <App />
        </AccessibilityPreferencesProvider>
    </AppErrorBoundary>
</StrictMode>
);
