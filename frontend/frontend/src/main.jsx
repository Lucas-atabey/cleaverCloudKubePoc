import React from 'react';
import ReactDOM from 'react-dom/client';
import MainApp from './components/MainApp';  // nouveau fichier qui gère la navigation
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>,
);
