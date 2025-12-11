import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { getStoredToken, setAuthToken } from './lib/api'
import { CartProvider } from './context/CartContext.jsx'

const savedToken = getStoredToken()
if (savedToken) {
  setAuthToken(savedToken)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)
