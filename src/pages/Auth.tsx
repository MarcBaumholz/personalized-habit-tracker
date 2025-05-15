
import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  
  // Check if user is already logged in
  const [user, setUser] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setCheckingSession(false);
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Check if we're coming back from password reset
    if (searchParams.get('reset') === 'true') {
      toast({
        title: "Passwort zurücksetzen",
        description: "Sie können jetzt Ihr Passwort zurücksetzen.",
      });
    }
  }, [searchParams, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error logging in:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Registrierung erfolgreich",
        description: "Bitte überprüfen Sie Ihre E-Mail für den Bestätigungslink.",
      });
      
    } catch (error: any) {
      console.error('Error signing up:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // If already logged in and not checking session, redirect to dashboard
  if (user && !checkingSession) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show spinner while checking session
  if (checkingSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showResetForm) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <PasswordResetForm onBack={() => setShowResetForm(false)} />
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Willkommen</CardTitle>
          <CardDescription>
            Melden Sie sich an oder erstellen Sie ein Konto, um fortzufahren
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    E-Mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium">
                      Passwort
                    </label>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-xs"
                      type="button"
                      onClick={() => setShowResetForm(true)}
                    >
                      Passwort vergessen?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird angemeldet...
                    </>
                  ) : (
                    "Anmelden"
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label htmlFor="signup-email" className="text-sm font-medium">
                    E-Mail
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="name@example.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="signup-password" className="text-sm font-medium">
                    Passwort
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Passwort bestätigen
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird registriert...
                    </>
                  ) : (
                    "Registrieren"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-xs text-center text-gray-500 mt-2">
            Indem Sie sich anmelden oder registrieren, stimmen Sie unseren{" "}
            <a href="#" className="underline">Nutzungsbedingungen</a> und{" "}
            <a href="#" className="underline">Datenschutzrichtlinien</a> zu.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
