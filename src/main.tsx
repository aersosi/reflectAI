import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "@/context/SessionContext.tsx";

const defaultAppState = {
    someValue: '',
    anotherValue: 0,
    complexData: [],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <SessionProvider defaultInitialState={defaultAppState}>
              <App />
          </SessionProvider>
      </BrowserRouter>
  </StrictMode>,
)
