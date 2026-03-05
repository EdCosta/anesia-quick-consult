import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeUITheme } from '@/lib/uiTheme';

initializeUITheme();

createRoot(document.getElementById('root')!).render(<App />);
