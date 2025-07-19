import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // NO STRICT MODE
  // <StrictMode>
    <App />
  // </StrictMode>,
)
