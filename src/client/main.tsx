import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { Menu } from './menu';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Menu />
  </StrictMode>
);
