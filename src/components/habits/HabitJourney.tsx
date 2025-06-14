import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReflectionDialog } from "./ReflectionDialog";
import { useState } from "react";
import { HabitRow } from "./HabitRow";
import { format as formatDateFns, parseISO, subDays } from 'date-fns';
import type { DayStatus } from './WeeklyDayTracker'; // Import DayStatus type

export const HabitJourney = () => {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habitsData, error: habitsError } = await supabase
        .from("habits")
        .select("*, habit_completions(*), habit_reflections(*)")
        .eq("user_id", user.id)
        .order('created_at', { foreignTable: 'habit_completions', ascending: true }); // Ensure completions are somewhat ordered if needed

      if (habitsError) {
        console.error("Error fetching habits:", habitsError);
        throw habitsError;
      }
      return habitsData;
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

  const upsertHabitCompletionMutation = useMutation({
    mutationFn: async ({ 
      habitId, 
      date, 
      status 
    }: { 
      habitId: string; 
      date: Date; 
      status: DayStatus; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const formattedDate = formatDateFns(date, 'yyyy-MM-dd');
      const isForToday = formattedDate === formatDateFns(new Date(), 'yyyy-MM-dd');

      if (isForToday && (status === 'completed' || status === 'partial')) {
        const { data: currentHabit, error: fetchError } = await supabase
          .from('habits')
          .select('streak_count, last_completed_at')
          .eq('id', habitId)
          .single();

        if (fetchError) {
          console.error("Error fetching habit for streak update:", fetchError);
        } else if (currentHabit) {
          const isAlreadyMarkedToday = currentHabit.last_completed_at && formatDateFns(parseISO(currentHabit.last_completed_at), 'yyyy-MM-dd') === formattedDate;

          if (!isAlreadyMarkedToday) {
            const lastCompletionDate = currentHabit.last_completed_at ? formatDateFns(parseISO(currentHabit.last_completed_at), 'yyyy-MM-dd') : null;
            const yesterday = formatDateFns(subDays(new Date(), 1), 'yyyy-MM-dd');
            const newStreak = lastCompletionDate === yesterday ? (currentHabit.streak_count || 0) + 1 : 1;
            
            const { error: updateError } = await supabase
              .from('habits')
              .update({ streak_count: newStreak, last_completed_at: new Date().toISOString() })
              .eq('id', habitId);
            
            if (updateError) {
              console.error('Error updating streak:', updateError.message);
            }
          }
        }
      }

      if (status === null) {
        const { error: deleteError } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('user_id', user.id)
          .eq('completed_date', formattedDate);
        if (deleteError) throw deleteError;
        return { status: 'deleted' }; 
      } else {
        const { data, error } = await supabase
          .from('habit_completions')
          .upsert(
            {
              habit_id: habitId,
              user_id: user.id,
              completed_date: formattedDate,
              status: status, 
            },
            {
              onConflict: 'habit_id,user_id,completed_date', 
            }
          )
          .select(); 

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
    onError: (error) => {
      console.error("Error updating weekly completion:", error);
      toast({
        title: "Fehler",
        description: "Wöchentlicher Fortschritt konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });

  const handleUpdateWeeklyCompletion = (habitId: string, date: Date, currentStatus: DayStatus) => {
    let newStatus: DayStatus;
    if (currentStatus === null) {
      newStatus = 'completed';
    } else if (currentStatus === 'completed') {
      newStatus = 'partial';
    } else {
      newStatus = null;
    }
    upsertHabitCompletionMutation.mutate({ habitId, date, status: newStatus });
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
      
      <div className="space-y-4"> {/* Changed from space-y-6 to space-y-4 to accommodate new tracker */}
        {habits?.map((habit: any) => (
          <HabitRow 
            key={habit.id}
            habit={habit}
            onReflectionClick={setSelectedHabit}
            onUpdateWeeklyCompletion={handleUpdateWeeklyCompletion} 
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
