import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { fabric } from 'fabric'
import './index.css'
import App from './App.tsx'

if (typeof window !== 'undefined') {
  (window as any).fabric = (fabric as any)?.fabric || fabric;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
