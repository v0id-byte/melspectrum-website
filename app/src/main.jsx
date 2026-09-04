import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LangProvider } from './i18n';
import MotionProvider from './lib/motion/MotionProvider';
import './styles/tokens.css';
import './styles/app.css';
import './styles/motion.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <MotionProvider>
        <App />
      </MotionProvider>
    </LangProvider>
  </React.StrictMode>,
);
