import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "@/context/SessionContext";
import { defaultAppState } from "@/data/data.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <QueryClientProvider client={queryClient}>
              <SessionProvider defaultInitialState={defaultAppState}>
                  <App />
              </SessionProvider>
          </QueryClientProvider>
      </BrowserRouter>
  </StrictMode>,
)
