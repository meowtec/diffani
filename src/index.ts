import 'prismjs';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

createRoot(document.querySelector('#root') as HTMLElement).render(
  React.createElement(App)
);
