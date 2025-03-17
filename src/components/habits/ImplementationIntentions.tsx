
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Save, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface ImplementationIntention {
  if: string;
  then: string;
  id: string;
}

export const ImplementationIntentions = ({ habitId }: { habitId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [intentions, setIntentions] = useState<ImplementationIntention[]>([
    { if: "", then: "", id: uuidv4() },
  ]);

  // Query to fetch existing intentions
  const { data: toolboxes } = useQuery({
    queryKey: ["habit-toolboxes", habitId, "intentions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_toolboxes")
        .select("*")
        .eq("habit_id", habitId)
        .eq("type", "intentions");

      if (error) throw error;
      return data || [];
    },
    onSuccess: (data) => {
      if (data.length > 0 && data[0].steps) {
        try {
          // Parse the steps from the database
          const parsedSteps = JSON.parse(data[0].steps);
          if (Array.isArray(parsedSteps) && parsedSteps.length > 0) {
            setIntentions(parsedSteps);
          }
        } catch (e) {
          console.error("Error parsing intentions:", e);
        }
      }
    },
  });

  const addIntention = () => {
    setIntentions([...intentions, { if: "", then: "", id: uuidv4() }]);
  };

  const updateIntention = (id: string, field: "if" | "then", value: string) => {
    setIntentions(
      intentions.map((intent) =>
        intent.id === id ? { ...intent, [field]: value } : intent
      )
    );
  };

  const removeIntention = (id: string) => {
    setIntentions(intentions.filter((intent) => intent.id !== id));
  };

  const createToolboxMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Convert steps to string for storage
      const stepsJson = JSON.stringify(intentions);

      if (toolboxes && toolboxes.length > 0) {
        // Update existing toolbox
        const { error } = await supabase
          .from("habit_toolboxes")
          .update({
            steps: stepsJson,
            updated_at: new Date().toISOString(),
          })
          .eq("id", toolboxes[0].id);

        if (error) throw error;
      } else {
        // Create new toolbox
        const { error } = await supabase
          .from("habit_toolboxes")
          .insert({
            habit_id: habitId,
            user_id: user.id,
            type: "intentions",
            title: "Implementation Intentions",
            description: "If-Then plans for your habit",
            steps: stepsJson,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-toolboxes", habitId] });
      toast({
        title: "Intentionen gespeichert",
        description: "Deine Implementation Intentions wurden gespeichert.",
      });
    },
  });

  const handleSave = () => {
    // Filter out empty intentions
    const validIntentions = intentions.filter(
      (i) => i.if.trim() !== "" && i.then.trim() !== ""
    );
    
    if (validIntentions.length === 0) {
      toast({
        title: "Keine Intentionen",
        description: "Bitte füge mindestens eine vollständige Intention hinzu.",
        variant: "destructive",
      });
      return;
    }
    
    setIntentions(validIntentions);
    createToolboxMutation.mutate();
  };

  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="text-blue-700">Implementation Intentions</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4 mb-4">
          <p className="text-sm text-gray-600">
            Implementation Intentions sind "Wenn-Dann" Pläne, die es dir leichter machen, 
            deine Gewohnheit zu einer bestimmten Zeit oder in einer bestimmten Situation auszuführen.
          </p>
        </div>

        <div className="space-y-4">
          {intentions.map((intention, index) => (
            <div key={intention.id} className="space-y-3 p-3 border rounded-md">
              <div className="flex items-center gap-2">
                <Label className="w-20 shrink-0">Wenn:</Label>
                <Input
                  placeholder="z.B. Wenn ich morgens aufstehe..."
                  value={intention.if}
                  onChange={(e) => updateIntention(intention.id, "if", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="w-20 shrink-0">Dann:</Label>
                <Input
                  placeholder="z.B. Dann mache ich direkt 10 Kniebeugen"
                  value={intention.then}
                  onChange={(e) => updateIntention(intention.id, "then", e.target.value)}
                />
              </div>
              {intentions.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeIntention(intention.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto block"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Löschen
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={addIntention}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Intention hinzufügen
          </Button>
          <Button 
            onClick={handleSave}
            className="flex items-center"
          >
            <Save className="h-4 w-4 mr-1" />
            Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
