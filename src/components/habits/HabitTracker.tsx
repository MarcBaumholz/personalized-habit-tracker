import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, BellDot, AlertCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";
import { SurpriseAnimation } from "@/components/feedback/SurpriseAnimation";
import { useSurpriseAnimation } from "@/hooks/useSurpriseAnimation";

export const HabitTracker = () => {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { animations, triggerAnimation } = useSurpriseAnimation();

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

      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from("habit_completions")
        .insert({
          habit_id: habit.id,
          user_id: user.id,
          completed_date: today,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Gewohnheit abgeschlossen! 🎉",
        description: "Weiter so! Du bist auf einem guten Weg.",
      });
    },
  });

  const addReflectionMutation = useMutation({
    mutationFn: async ({ habit, text }: { habit: any; text: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_reflections")
        .insert({
          habit_id: habit.id,
          user_id: user.id,
          reflection_text: text,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setSelectedHabit(null);
      setReflection("");
      toast({
        title: "Reflexion gespeichert",
        description: "Deine wöchentliche Reflexion wurde erfolgreich gespeichert.",
      });
    },
  });

  const calculateProgress = (habit: any) => {
    const completions = habit.habit_completions?.length || 0;
    return Math.round((completions / 66) * 100);
  };

  const isCompletedToday = (habit: any) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.habit_completions?.some((c: any) => 
      c.completed_date === today
    );
  };

  const needsWeeklyReflection = (habit: any) => {
    const lastReflection = habit.habit_reflections?.[0];
    if (!lastReflection) return true;
    
    const daysSinceLastReflection = differenceInDays(
      new Date(),
      new Date(lastReflection.created_at)
    );
    
    return daysSinceLastReflection >= 7;
  };

  const handleComplete = async (habit: any, event: React.MouseEvent) => {
    if (!isCompletedToday(habit)) {
      triggerAnimation(event);
      completeHabitMutation.mutate(habit);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      {animations.map(({ id, x, y }) => (
        <SurpriseAnimation key={id} position={{ x, y }} />
      ))}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Deine Gewohnheiten</h2>
      </div>
      
      <div className="space-y-4">
        {habits?.map((habit: any) => (
          <div key={habit.id} className="space-y-3 p-4 bg-secondary/10 rounded-lg animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{habit.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {habit.habit_completions?.length || 0} Tage Streak
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={(e) => handleComplete(habit, e)}
                  className="transition-transform hover:scale-110"
                >
                  <CheckCircle 
                    className={`h-5 w-5 ${isCompletedToday(habit) ? "text-green-500" : ""}`} 
                  />
                </Button>
                <Button
                  size="sm"
                  variant={needsWeeklyReflection(habit) ? "destructive" : "outline"}
                  onClick={() => setSelectedHabit(habit)}
                  className="transition-transform hover:scale-110"
                >
                  <BellDot className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Progress 
              value={calculateProgress(habit)} 
              className="h-2 transition-all duration-500" 
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Fortschritt: {calculateProgress(habit)}%</span>
              <span>
                Noch {66 - (habit.habit_completions?.length || 0)} Tage bis zum Automatismus
              </span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedHabit} onOpenChange={(open) => !open && setSelectedHabit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wöchentliche Reflexion</DialogTitle>
            <DialogDescription>
              Reflektiere über deinen Fortschritt und deine Erfahrungen der letzten Woche.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Teile deine Gedanken..."
              className="h-32"
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                if (reflection.trim()) {
                  addReflectionMutation.mutate({
                    habit: selectedHabit,
                    text: reflection,
                  });
                }
              }}
              className="w-full sm:w-auto"
            >
              Reflexion speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
