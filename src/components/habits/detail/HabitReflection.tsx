
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Star, BellDot, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HabitReflectionProps {
  habitId: string;
}

export const HabitReflection = ({ habitId }: HabitReflectionProps) => {
  const { toast } = useToast();
  const [reflection, setReflection] = useState("");

  const saveReflectionMutation = useMutation({
    mutationFn: async (reflectionText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_reflections")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          reflection_text: reflectionText
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setReflection("");
      toast({
        title: "Reflexion gespeichert",
        description: "Deine Reflexion wurde erfolgreich gespeichert.",
      });
    },
  });

  const handleReflectionSubmit = () => {
    if (reflection.trim()) {
      saveReflectionMutation.mutate(reflection);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Täglicher Check-in</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-4">
          <Button variant="outline" className="flex flex-col items-center p-3">
            <CheckCircle className="h-6 w-6 mb-1 text-green-500" />
            <span className="text-xs">Erledigt</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-3">
            <Star className="h-6 w-6 mb-1 text-yellow-500" />
            <span className="text-xs">Besonders gut</span>
          </Button>
          
          <Button variant="outline" className="flex flex-col items-center p-3">
            <BellDot className="h-6 w-6 mb-1 text-blue-500" />
            <span className="text-xs">Erinnerung</span>
          </Button>
        </div>
        
        <div className="mt-6">
          <Label htmlFor="reflection" className="mb-2 block">Reflexion</Label>
          <Textarea 
            id="reflection"
            placeholder="Wie lief es heute mit deiner Gewohnheit?"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="h-24 mb-3"
          />
          <Button onClick={handleReflectionSubmit} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Reflexion speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
