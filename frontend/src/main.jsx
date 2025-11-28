import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'   // 추가

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>     {/* App을 완전히 감싼다 */}
      <App />
    </AuthProvider>
  </StrictMode>
)