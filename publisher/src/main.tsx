import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { normalizePackageManifest } from './packageManifest.js';
import './styles.css';

const originalJsonParse = JSON.parse.bind(JSON);
JSON.parse = ((text: string, reviver?: (this: unknown, key: string, value: unknown) => unknown) => {
  const parsed = originalJsonParse(text, reviver);
  if (
    parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    Array.isArray((parsed as { images?: unknown }).images) &&
    ('slug' in parsed || 'destination' in parsed || 'destinationPath' in parsed)
  ) {
    return normalizePackageManifest(parsed);
  }
  return parsed;
}) as typeof JSON.parse;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
