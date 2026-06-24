import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initScrollbarAutohide } from './lib/scrollbar'
import { lockZoom } from './lib/lockZoom'
import './styles/theme.css'

initScrollbarAutohide()
lockZoom()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
