import React, { useState } from 'react';
import Auth from './Auth';
import App from './App';

export default function MainApp() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return token ? <App token={token} onLogout={handleLogout} /> : <Auth onLogin={handleLogin} />;
}
