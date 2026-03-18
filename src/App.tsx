import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Access from "./pages/Access";
import Welcome from "./pages/Welcome";
import WelcomeBack from "./pages/WelcomeBack";
import Questionnaire from "./pages/Questionnaire";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

import RequireSession from "@/components/auth/RequireSession";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/access" element={<Access />} />

          {/* Session required */}
          <Route
            path="/welcome"
            element={
              <RequireSession>
                <Welcome />
              </RequireSession>
            }
          />
          <Route
            path="/welcome-back"
            element={
              <RequireSession>
                <WelcomeBack />
              </RequireSession>
            }
          />
          <Route
            path="/questionnaire"
            element={
              <RequireSession>
                <Questionnaire />
              </RequireSession>
            }
          />
          <Route
            path="/thank-you"
            element={
              <RequireSession>
                <ThankYou />
              </RequireSession>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
