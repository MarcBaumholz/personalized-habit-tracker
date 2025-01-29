import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CommitmentPact = ({ onComplete }: { onComplete: () => void }) => {
  const [signature, setSignature] = useState("");
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

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
        title: "Pakt geschlossen",
        description: "Deine Unterschrift wurde erfolgreich gespeichert.",
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
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Dein Commitment Pakt</h2>
        <p className="text-muted-foreground">
          Verbleibende Zeit: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")} Minuten
        </p>
      </div>

      <div className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <p>Ich verpflichte mich hiermit:</p>
          <ul>
            <li>30 Minuten täglich für meine persönliche Entwicklung zu investieren</li>
            <li>Ehrlich und reflektiert an meinen Gewohnheiten zu arbeiten</li>
            <li>Die Werkzeuge und Ressourcen dieser Plattform bestmöglich zu nutzen</li>
            <li>Meine Fortschritte regelmäßig zu überprüfen und anzupassen</li>
          </ul>
        </div>

        <div className="space-y-2">
          <label htmlFor="signature" className="block text-sm font-medium">
            Deine Unterschrift
          </label>
          <Input
            id="signature"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Dein Name als Unterschrift"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          Pakt bestätigen
        </Button>
      </div>
    </Card>
  );
};