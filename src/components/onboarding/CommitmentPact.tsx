
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Rocket, Star, Heart } from "lucide-react";

export const CommitmentPact = ({ onComplete }: { onComplete: () => void }) => {
  const [signature, setSignature] = useState("");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!signature) {
      toast({
        title: "Unterschrift erforderlich",
        description: "Bitte unterschreibe den Pakt, um fortzufahren.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await supabase.from("onboarding_responses").insert({
        user_id: user.id,
        question_key: "commitment_signature",
        response: signature,
      });

      toast({
        title: "Willkommen an Bord!",
        description: "Lass uns deine Reise zu besseren Gewohnheiten beginnen.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Unterschrift konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="p-8 max-w-2xl w-full bg-white/90 backdrop-blur-sm border border-blue-100 shadow-xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center gap-4 mb-4">
              <Rocket className="h-10 w-10 text-blue-600" />
              <Star className="h-10 w-10 text-blue-500" />
              <Heart className="h-10 w-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900">
              Start Your Habit Journey
            </h1>
            <p className="text-blue-600 max-w-md mx-auto">
              Beginne deine Transformation zu einem besseren Selbst. Jede große Reise beginnt mit einem ersten Schritt.
            </p>
          </div>

          <div className="space-y-4 bg-blue-50/50 p-6 rounded-lg">
            <p className="text-blue-800 font-medium">Mit meiner Unterschrift bestätige ich:</p>
            <ul className="space-y-3 text-blue-700">
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 flex-shrink-0" />
                <span>Ich bin bereit, Zeit in meine persönliche Entwicklung zu investieren</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 flex-shrink-0" />
                <span>Ich verstehe, dass Veränderung ein Prozess ist und bleibe geduldig</span>
              </li>
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 flex-shrink-0" />
                <span>Ich werde meine Fortschritte regelmäßig reflektieren</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <label htmlFor="signature" className="block text-sm font-medium text-blue-700">
              Deine Unterschrift
            </label>
            <Input
              id="signature"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="Dein Name als Unterschrift"
              className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Meine Reise beginnen
          </Button>
        </div>
      </Card>
    </div>
  );
};
