
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Plus, Save, Check } from "lucide-react";

interface HabitStackingProps {
  habitId?: string;
  onSave?: (data: any) => void;
}

export const HabitStacking = ({ habitId, onSave }: HabitStackingProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [stackData, setStackData] = useState({
    anchorHabitId: "",
    description: ""
  });

  // Get all habits to use as anchor habits
  const { data: habits } = useQuery({
    queryKey: ["habits-for-stacking"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habits")
        .select("id, name, streak_count")
        .eq("user_id", user.id)
        .neq("id", habitId) // Exclude current habit
        .order("streak_count", { ascending: false });

      return data || [];
    }
  });

  // Get existing habit stack if any
  const { data: existingStack } = useQuery({
    queryKey: ["habit-stack", habitId],
    queryFn: async () => {
      if (!habitId) return null;
      
      const { data } = await supabase
        .from("habit_toolboxes")
        .select("*")
        .eq("habit_id", habitId)
        .eq("type", "stack")
        .single();
      
      if (data) {
        setStackData({
          anchorHabitId: data.cue || "",
          description: data.description || ""
        });
      }
      
      return data;
    },
    enabled: !!habitId
  });

  // Create or update a habit stack
  const saveStackMutation = useMutation({
    mutationFn: async () => {
      if (!stackData.anchorHabitId || !stackData.description) {
        throw new Error("Missing required fields");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const stackPayload = {
        habit_id: habitId,
        user_id: user.id,
        type: "stack",
        title: "Habit Stacking",
        description: stackData.description,
        category: "Habit Stacking",
        cue: stackData.anchorHabitId // Using cue field to store the anchor habit ID
      };

      if (existingStack) {
        // Update existing stack
        const { data, error } = await supabase
          .from("habit_toolboxes")
          .update(stackPayload)
          .eq("id", existingStack.id);

        if (error) throw error;
        return data;
      } else {
        // Create new stack
        const { data, error } = await supabase
          .from("habit_toolboxes")
          .insert(stackPayload);

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Habit Stack gespeichert",
        description: "Dein Habit Stack wurde erfolgreich gespeichert.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["habit-stack", habitId] });
      
      if (onSave) {
        onSave(stackData);
      }
    },
    onError: (error) => {
      console.error("Error saving habit stack:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Der Habit Stack konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (!stackData.anchorHabitId) {
      toast({
        title: "Ankergewohnheit fehlt",
        description: "Bitte wähle eine Ankergewohnheit aus.",
        variant: "destructive",
      });
      return;
    }

    if (!stackData.description) {
      toast({
        title: "Beschreibung fehlt",
        description: "Bitte beschreibe, wie du die Gewohnheiten verknüpfen möchtest.",
        variant: "destructive",
      });
      return;
    }

    saveStackMutation.mutate();
  };

  // Get the selected anchor habit name
  const selectedHabit = habits?.find(h => h.id === stackData.anchorHabitId);

  return (
    <Card className="shadow-sm border border-green-100">
      <CardHeader className="bg-green-50 pb-4 pt-5">
        <CardTitle className="text-xl text-green-800">Habit Stacking</CardTitle>
        <p className="text-sm text-gray-600">
          Verbinde diese Gewohnheit mit einer bereits etablierten Gewohnheit.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="font-medium text-amber-800 mb-2">Warum Habit Stacking funktioniert:</h3>
          <p className="text-sm text-amber-700">
            Habit Stacking nutzt bestehende Gewohnheiten als zuverlässige Auslöser für neue Gewohnheiten. 
            Nach der Formel "Nach/Vor [bestehende Gewohnheit] werde ich [neue Gewohnheit]" wird die neue 
            Gewohnheit an einen bereits verankerten Kontext geknüpft.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anchorHabit">Ankergewohnheit auswählen</Label>
            <Select
              value={stackData.anchorHabitId}
              onValueChange={(value) => setStackData({ ...stackData, anchorHabitId: value })}
            >
              <SelectTrigger id="anchorHabit">
                <SelectValue placeholder="Wähle eine etablierte Gewohnheit" />
              </SelectTrigger>
              <SelectContent>
                {habits && habits.map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    <div className="flex items-center">
                      {habit.name}
                      {habit.streak_count >= 30 && (
                        <Check className="h-4 w-4 ml-2 text-green-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedHabit && (
              <p className="text-xs text-green-600 mt-1">
                {selectedHabit.streak_count >= 30 
                  ? `Ideal! Diese Gewohnheit ist bereits seit ${selectedHabit.streak_count} Tagen etabliert.` 
                  : `Diese Gewohnheit ist seit ${selectedHabit.streak_count} Tagen aktiv.`}
              </p>
            )}
          </div>

          {stackData.anchorHabitId && (
            <div className="flex items-center justify-center my-6">
              <div className="px-4 py-2 bg-green-100 rounded-lg text-green-800">
                {selectedHabit?.name}
              </div>
              <ChevronRight className="mx-2 text-green-600" />
              <div className="px-4 py-2 bg-blue-100 rounded-lg text-blue-800">
                Neue Gewohnheit
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="stackDescription">Beschreibe deinen Habit Stack</Label>
            <Textarea
              id="stackDescription"
              value={stackData.description}
              onChange={(e) => setStackData({ ...stackData, description: e.target.value })}
              placeholder={`Nach/Vor [${selectedHabit?.name || 'Ankergewohnheit'}] werde ich [neue Gewohnheit].`}
              className="h-20"
            />
          </div>
        </div>

        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Stack speichern
        </Button>
      </CardContent>
    </Card>
  );
};
