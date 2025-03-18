
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReflectionDialog } from "./ReflectionDialog";
import { useState } from "react";
import { HabitRow } from "./HabitRow";

export const HabitJourney = () => {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*, habit_completions(*), habit_reflections(*)")
        .eq("user_id", user.id);

      return habitsData;
    },
  });

  const completeHabitMutation = useMutation({
    mutationFn: async (habit: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_completions")
        .insert({
          habit_id: habit.id,
          user_id: user.id,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Gewohnheit abgeschlossen",
        description: "Dein Fortschritt wurde gespeichert.",
      });
    },
  });

  const updateSatisfactionMutation = useMutation({
    mutationFn: async (habit: any) => {
      const { data, error } = await supabase
        .from("habits")
        .update({ satisfaction_level: habit.satisfaction_level === 'high' ? 'low' : 'high' })
        .eq("id", habit.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Zufriedenheit aktualisiert",
        description: "Die Gewohnheit wurde als zufriedenstellend markiert.",
      });
    },
  });

  const saveReflectionMutation = useMutation({
    mutationFn: async ({ 
      habitId, 
      reflection, 
      obstacles, 
      srhiResponses 
    }: { 
      habitId: string; 
      reflection: string; 
      obstacles: string;
      srhiResponses?: Record<number, string>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const payload: any = {
        habit_id: habitId,
        user_id: user.id,
        reflection_type: "weekly"
      };
      
      if (reflection) {
        payload.reflection_text = reflection;
      }
      
      if (obstacles) {
        payload.obstacles = obstacles;
      }
      
      if (srhiResponses && Object.keys(srhiResponses).length > 0) {
        payload.srhi_responses = srhiResponses;
      }
      
      console.log("Saving reflection with payload:", payload);
        
      const { data, error } = await supabase
        .from("habit_reflections")
        .insert(payload);
        
      if (error) {
        console.error("Error saving reflection:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setSelectedHabit(null);
      toast({
        title: "Reflexion gespeichert",
        description: "Deine Reflexion wurde erfolgreich gespeichert.",
      });
    },
    onError: (error) => {
      console.error("Error in saveReflectionMutation:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Deine Reflexion konnte nicht gespeichert werden.",
        variant: "destructive"
      });
    }
  });

  const isCompletedToday = (habit: any) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.habit_completions?.some((c: any) => 
      c.completed_date === today
    );
  };

  const handleReflectionSubmit = (reflection: string, obstacles: string, srhiResponses?: Record<number, string>) => {
    if (selectedHabit) {
      console.log("Submitting reflection:", { 
        reflection, 
        obstacles, 
        srhiResponses, 
        habitId: selectedHabit.id 
      });
      
      saveReflectionMutation.mutate({ 
        habitId: selectedHabit.id, 
        reflection, 
        obstacles,
        srhiResponses
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Deine Gewohnheiten</h2>
      
      <div className="space-y-6">
        {habits?.map((habit: any) => (
          <HabitRow 
            key={habit.id}
            habit={habit}
            onReflectionClick={setSelectedHabit}
            onCompletionClick={completeHabitMutation.mutate}
            onSatisfactionClick={updateSatisfactionMutation.mutate}
            isCompletedToday={isCompletedToday}
          />
        ))}
      </div>

      {selectedHabit && (
        <ReflectionDialog
          isOpen={!!selectedHabit}
          onClose={() => setSelectedHabit(null)}
          questions={[
            "Dieses Verhalten ist etwas, das ich automatisch tue.",
            "Dieses Verhalten ist etwas, das ich ohne nachzudenken tue.",
            "Dieses Verhalten ist etwas, das ich tue, ohne dass ich mich daran erinnern muss.",
            "Dieses Verhalten ist etwas, das typisch für mich ist.",
            "Dieses Verhalten ist etwas, das ich schon lange tue.",
          ]}
          responses={{}}
          onResponseChange={() => {}}
          reflection=""
          onReflectionChange={() => {}}
          onSubmit={handleReflectionSubmit}
          habit={selectedHabit}
        />
      )}
    </Card>
  );
};
