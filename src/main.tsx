import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import { defaultSession } from "@/config/initialSession.ts";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnthropicProvider } from "@/contexts/AnthropicContext";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <QueryClientProvider client={queryClient}>
              <SessionProvider initialSession={defaultSession}>
                  <AnthropicProvider>
                      <App />
                  </AnthropicProvider>
              </SessionProvider>
          </QueryClientProvider>
      </BrowserRouter>
  </StrictMode>,
)
