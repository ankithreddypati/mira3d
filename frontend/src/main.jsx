import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log("backend api root:", window.location.origin + "/invocations");

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

