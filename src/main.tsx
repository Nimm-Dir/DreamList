import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { preloadData } from './store/useStore'
import './styles/globals.css'

preloadData()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
