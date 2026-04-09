// Entry point — mounts <App /> into the #root div in index.html
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // keep your existing global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);