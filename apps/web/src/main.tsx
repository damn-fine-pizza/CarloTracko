import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { setupSyncTriggers, ensureSyncState, runSync } from './sync/engine';

setupSyncTriggers();
void ensureSyncState().then(() => runSync());

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
