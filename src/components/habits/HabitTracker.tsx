import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const HabitTracker = () => {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("user_id", user.id);

      return data;
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
        description: "Deine Gedanken wurden erfolgreich gespeichert.",
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

  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Deine Gewohnheiten</h2>
      </div>
      
      <div className="space-y-4">
        {habits?.map((habit: any) => (
          <div key={habit.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{habit.name}</h3>
                <p className="text-sm text-text-secondary">
                  {habit.habit_completions?.length || 0} Tage Streak
                </p>
              </div>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  if (!isCompletedToday(habit)) {
                    completeHabitMutation.mutate(habit);
                  }
                  setSelectedHabit(habit);
                }}
              >
                <CheckCircle 
                  className={`h-5 w-5 ${isCompletedToday(habit) ? "text-green-500" : ""}`} 
                />
              </Button>
            </div>
            <Progress value={calculateProgress(habit)} className="h-2" />
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Fortschritt: {calculateProgress(habit)}%</span>
              <span>
                Noch {66 - (habit.habit_completions?.length || 0)} Tage bis zum Automatismus
              </span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedHabit} onOpenChange={(open) => !open && setSelectedHabit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tagesreflexion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Wie war deine Erfahrung heute mit dieser Gewohnheit?
            </p>
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
            >
              Reflexion speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};