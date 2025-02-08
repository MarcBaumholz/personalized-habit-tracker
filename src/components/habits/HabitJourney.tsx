
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, BellDot, Star, Flame } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReflectionDialog } from "./ReflectionDialog";
import { EditHabitDialog } from "./EditHabitDialog";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export const HabitJourney = () => {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const { data: habits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
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

  const calculateProgress = (habit: any) => {
    const completions = habit.habit_completions?.length || 0;
    return Math.round((completions / 66) * 100);
  };

  const getStreakCount = (habit: any) => {
    return habit.habit_completions?.length || 0;
  };

  const getRemainingDays = (habit: any) => {
    const completions = habit.habit_completions?.length || 0;
    return 66 - completions;
  };

  const isCompletedToday = (habit: any) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.habit_completions?.some((c: any) => 
      c.completed_date === today
    );
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">Deine Gewohnheiten</h2>
      
      <div className="space-y-6">
        {habits?.map((habit: any) => (
          <div key={habit.id} className="space-y-4">
            <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{habit.name}</h3>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">{getStreakCount(habit)}</span>
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
              </div>
              <div className={`flex ${isMobile ? 'justify-start' : 'items-center'} gap-2 flex-wrap`}>
                <EditHabitDialog habit={habit} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedHabit(habit)}
                >
                  <BellDot className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateSatisfactionMutation.mutate(habit)}
                >
                  <Star className={`h-4 w-4 ${habit.satisfaction_level === 'high' ? 'text-yellow-400' : 'text-gray-400'}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    if (!isCompletedToday(habit)) {
                      completeHabitMutation.mutate(habit);
                    }
                  }}
                >
                  <CheckCircle 
                    className={`h-4 w-4 ${isCompletedToday(habit) ? "text-green-500" : "text-gray-400"}`} 
                  />
                </Button>
              </div>
            </div>
            <Progress value={calculateProgress(habit)} className="h-2" />
            <div className={`${isMobile ? 'flex flex-col space-y-1' : 'flex justify-between'} text-sm text-gray-600`}>
              <span>Fortschritt: {calculateProgress(habit)}%</span>
              <span>
                Noch {getRemainingDays(habit)} Tage bis zum Automatismus
              </span>
            </div>
          </div>
        ))}
      </div>

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
        onSubmit={() => {}}
      />
    </Card>
  );
};
