import React from 'react';

import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import App from './App.jsx';
import './index.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { TelemetryProvider } from './context/TelemetryContext';
import { AlertProvider } from './context/AlertContext';
import { SimulationProvider } from './context/SimulationContext';

// Use HashRouter for Capacitor (mobile), BrowserRouter for web
const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <TelemetryProvider>
            <SimulationProvider>
              <AlertProvider>
                <App />
              </AlertProvider>
            </SimulationProvider>
          </TelemetryProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
