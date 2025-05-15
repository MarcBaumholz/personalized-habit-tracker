
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PasswordResetFormProps {
  onBack: () => void;
}

export const PasswordResetForm = ({ onBack }: PasswordResetFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth?reset=true",
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      toast({
        title: "E-Mail gesendet",
        description: "Eine Anleitung zum Zurücksetzen Ihres Passworts wurde an Ihre E-Mail gesendet.",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error?.message || "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.");
      toast({
        title: "Fehler",
        description: error?.message || "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Passwort zurücksetzen</CardTitle>
        <CardDescription>
          Geben Sie Ihre E-Mail-Adresse ein, und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col items-center p-4 gap-3 bg-green-50 rounded-lg text-center">
            <CheckCircle2 className="text-green-500 h-10 w-10" />
            <div>
              <h3 className="font-semibold mb-1">E-Mail gesendet!</h3>
              <p className="text-sm text-gray-600">
                Bitte überprüfen Sie Ihren Posteingang und folgen Sie den Anweisungen, um Ihr Passwort zurückzusetzen.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-Mail-Adresse
              </label>
              <Input
                id="email"
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
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
              disabled={isLoading || !email}
            >
              {isLoading ? "Wird gesendet..." : "Link zum Zurücksetzen senden"}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
          type="button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Anmeldung
        </Button>
      </CardFooter>
    </Card>
  );
};
