import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from "@/components/ui/sonner"
import App from './App.jsx'
import { ThemeProvider } from "./components/theme-provider"
import './i18n/config'
import { applySystemLanguageSettings } from './i18n/config'

// Apply system language settings
applySystemLanguageSettings()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
)
