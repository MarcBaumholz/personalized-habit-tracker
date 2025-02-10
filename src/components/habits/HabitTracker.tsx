
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HabitCard } from "./HabitCard";
import { ReflectionDialog } from "./ReflectionDialog";

const SRHI_QUESTIONS = [
  "Dieses Verhalten ist etwas, das ich automatisch tue.",
  "Dieses Verhalten ist etwas, das ich ohne nachzudenken tue.",
  "Dieses Verhalten ist etwas, das ich tue, ohne dass ich mich daran erinnern muss.",
  "Dieses Verhalten ist etwas, das typisch für mich ist.",
  "Dieses Verhalten ist etwas, das ich schon lange tue.",
];

export const HabitTracker = () => {
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [reflection, setReflection] = useState("");
  const [srhiResponses, setSrhiResponses] = useState<Record<number, string>>({});
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

  const addReflectionMutation = useMutation({
    mutationFn: async ({ habit, text, srhiScore }: { habit: any; text: string; srhiScore: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_reflections")
        .insert({
          habit_id: habit.id,
          user_id: user.id,
          reflection_text: text,
          srhi_score: srhiScore,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setSelectedHabit(null);
      setReflection("");
      setSrhiResponses({});
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

  const calculateSRHIScore = () => {
    const values = Object.values(srhiResponses);
    if (values.length === 0) return 0;
    
    const total = values.reduce((sum, value) => {
      return sum + (value === "3" ? 2 : value === "2" ? 1 : 0);
    }, 0);
    
    return Math.round((total / (values.length * 2)) * 100);
  };

  const isCompletedToday = (habit: any) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.habit_completions?.some((c: any) => 
      c.completed_date === today
    );
  };

  return (
    <Card className="p-6 space-y-4 bg-white">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Deine Gewohnheiten</h2>
      </div>
      
      <div className="space-y-4">
        {habits?.map((habit: any) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onComplete={completeHabitMutation.mutate}
            onReflect={setSelectedHabit}
            isCompletedToday={isCompletedToday}
            calculateProgress={calculateProgress}
          />
        ))}
      </div>

      <ReflectionDialog
        isOpen={!!selectedHabit}
        onClose={() => setSelectedHabit(null)}
        questions={SRHI_QUESTIONS}
        responses={srhiResponses}
        onResponseChange={(index, value) => 
          setSrhiResponses((prev) => ({ ...prev, [index]: value }))
        }
        reflection={reflection}
        onReflectionChange={setReflection}
        onSubmit={() => {
          if (Object.keys(srhiResponses).length === SRHI_QUESTIONS.length) {
            addReflectionMutation.mutate({
              habit: selectedHabit,
              text: reflection,
              srhiScore: calculateSRHIScore(),
            });
          } else {
            toast({
              title: "Bitte alle Fragen beantworten",
              description: "Beantworte bitte alle SRHI Fragen bevor du fortfährst.",
              variant: "destructive",
            });
          }
        }}
      />
    </Card>
  );
};
