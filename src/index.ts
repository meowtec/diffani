import 'prismjs';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { inject } from '@vercel/analytics';
import App from './app';

inject();
createRoot(document.querySelector('#root') as HTMLElement).render(
  React.createElement(App),
);
