
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ImplementationIntention {
  id?: string;
  cue: string;
  response: string;
}

interface ImplementationIntentionsProps {
  habitId: string;
  title?: string;
  description?: string;
}

export const ImplementationIntentions = ({ 
  habitId,
  title = "Implementationsabsichten",
  description = "Lege fest, wann und wie du deine Gewohnheit ausführen wirst, indem du auf bestimmte Situationen (Auslöser) mit einer konkreten Handlung reagierst."
}: ImplementationIntentionsProps) => {
  const [intentions, setIntentions] = useState<ImplementationIntention[]>([
    { cue: "", response: "" }
  ]);
  const queryClient = useQueryClient();

  // Fetch existing implementation intentions
  const { data: toolboxes } = useQuery({
    queryKey: ["habit-toolboxes", habitId, "implementation-intentions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("habit_toolboxes")
        .select("*")
        .eq("habit_id", habitId)
        .eq("category", "implementation_intentions");
      return data || [];
    }
  });

  // Set up intentions from fetched data
  useEffect(() => {
    if (toolboxes && toolboxes.length > 0) {
      const toolbox = toolboxes[0];
      
      if (toolbox.steps && Array.isArray(toolbox.steps)) {
        // Parse the steps - each step is a cue-response pair
        const loadedIntentions = toolbox.steps.map((step: string) => {
          const [cue, response] = step.split('::');
          return { cue, response };
        }).filter((intent: ImplementationIntention) => 
          intent.cue && intent.response
        );
        
        if (loadedIntentions.length > 0) {
          setIntentions(loadedIntentions);
        }
      }
    }
  }, [toolboxes]);

  // Save implementation intentions
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Format intentions for storage
      const steps = intentions
        .filter(i => i.cue.trim() && i.response.trim())
        .map(i => `${i.cue}::${i.response}`);

      // If we have no valid intentions, don't save
      if (steps.length === 0) return null;

      // Check if we already have a toolbox for implementation intentions
      const { data: existingToolboxes } = await supabase
        .from("habit_toolboxes")
        .select("*")
        .eq("habit_id", habitId)
        .eq("category", "implementation_intentions");

      if (existingToolboxes && existingToolboxes.length > 0) {
        // Update existing toolbox
        const { data, error } = await supabase
          .from("habit_toolboxes")
          .update({
            steps: steps,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingToolboxes[0].id);

        if (error) throw error;
        return data;
      } else {
        // Create new toolbox
        const { data, error } = await supabase
          .from("habit_toolboxes")
          .insert({
            habit_id: habitId,
            user_id: user.id,
            title: "Implementationsabsichten",
            description: "Wenn-Dann Pläne für deine Gewohnheit",
            category: "implementation_intentions",
            type: "implementation_intentions",
            steps: steps
          });

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-toolboxes"] });
    }
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const addIntention = () => {
    setIntentions([...intentions, { cue: "", response: "" }]);
  };

  const removeIntention = (index: number) => {
    const newIntentions = [...intentions];
    newIntentions.splice(index, 1);
    if (newIntentions.length === 0) {
      newIntentions.push({ cue: "", response: "" });
    }
    setIntentions(newIntentions);
  };

  const updateIntention = (index: number, field: keyof ImplementationIntention, value: string) => {
    const newIntentions = [...intentions];
    newIntentions[index][field] = value;
    setIntentions(newIntentions);
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="space-y-4">
        {intentions.map((intention, index) => (
          <div key={index} className="grid grid-cols-1 gap-4 p-4 border rounded-lg relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={() => removeIntention(index)}
            >
              <X className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`cue-${index}`}>Wenn (Auslöser/Situation)</Label>
              <Input
                id={`cue-${index}`}
                value={intention.cue}
                onChange={(e) => updateIntention(index, "cue", e.target.value)}
                placeholder="z.B. Wenn ich morgens aufstehe..."
              />
            </div>

            <div>
              <Label htmlFor={`response-${index}`}>Dann (Reaktion/Handlung)</Label>
              <Textarea
                id={`response-${index}`}
                value={intention.response}
                onChange={(e) => updateIntention(index, "response", e.target.value)}
                placeholder="z.B. ...dann werde ich 10 Minuten meditieren."
                rows={2}
              />
            </div>
          </div>
        ))}

        <Button variant="outline" className="w-full" onClick={addIntention}>
          <Plus className="mr-2 h-4 w-4" /> Weiteren Plan hinzufügen
        </Button>

        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          Speichern
        </Button>
      </div>
    </Card>
  );
};
