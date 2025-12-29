import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx'; // Ensure this matches your actual App component's name and path

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
