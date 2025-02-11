
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Calendar from "./pages/Calendar";
import Education from "./pages/Education";
import Toolbox from "./pages/Toolbox";
import Archive from "./pages/Archive";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={session ? <Index /> : <Navigate to="/auth" />}
            />
            <Route
              path="/auth"
              element={!session ? <Auth /> : <Navigate to="/" />}
            />
            <Route
              path="/onboarding"
              element={session ? <Onboarding /> : <Navigate to="/auth" />}
            />
            <Route
              path="/dashboard"
              element={session ? <Dashboard /> : <Navigate to="/auth" />}
            />
            <Route
              path="/profile"
              element={session ? <Profile /> : <Navigate to="/auth" />}
            />
            <Route
              path="/calendar"
              element={session ? <Calendar /> : <Navigate to="/auth" />}
            />
            <Route
              path="/education"
              element={session ? <Education /> : <Navigate to="/auth" />}
            />
            <Route
              path="/toolbox"
              element={session ? <Toolbox /> : <Navigate to="/auth" />}
            />
            <Route
              path="/archive"
              element={session ? <Archive /> : <Navigate to="/auth" />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
