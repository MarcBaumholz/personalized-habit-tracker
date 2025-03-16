import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FcGoogle } from "react-icons/fc";
const Auth = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();

    // Setup auth state listener
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const {
          error
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account."
        });
      } else {
        const {
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleAuth = async () => {
    try {
      const {
        error
      } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-[#1A1F2C] p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-[#242B3D] border-none shadow-xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-gray-400">
            {isSignUp ? "Sign up to start building better habits" : "Sign in to continue your journey"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="space-y-2">
            
          </div>
          <div className="space-y-2">
            <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="bg-[#1A1F2C] border-gray-700 text-white placeholder:text-gray-500" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#242B3D] text-gray-400">Or</span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full border-gray-700 text-white hover:bg-[#1A1F2C]" onClick={handleGoogleAuth}>
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-gray-400">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" className="text-blue-500 hover:text-blue-400" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </Card>
    </div>;
};
export default Auth;