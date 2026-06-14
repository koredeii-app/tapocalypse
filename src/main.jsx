import React from 'react';
import ReactDOM from 'react-dom/client';
import { I18nProvider } from './i18n/I18nProvider';
import App from './App';
import './styles/globals.css';

// SW が更新されて新バージョンが制御を引き継いだら即リロード
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
