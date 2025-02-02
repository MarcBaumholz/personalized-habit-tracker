import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, BellDot, BarChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

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
          <div key={habit.id} className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{habit.name}</h3>
                <p className="text-sm text-gray-600">
                  {habit.habit_completions?.length || 0} Tage Streak
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    if (!isCompletedToday(habit)) {
                      completeHabitMutation.mutate(habit);
                    }
                  }}
                >
                  <CheckCircle 
                    className={`h-5 w-5 ${isCompletedToday(habit) ? "text-green-500" : "text-gray-400"}`} 
                  />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedHabit(habit)}
                >
                  <BellDot className="h-4 w-4 mr-2" />
                  Reflektieren
                </Button>
              </div>
            </div>
            <Progress value={calculateProgress(habit)} className="h-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Fortschritt: {calculateProgress(habit)}%</span>
              <span>
                Noch {66 - (habit.habit_completions?.length || 0)} Tage bis zum Automatismus
              </span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedHabit} onOpenChange={(open) => !open && setSelectedHabit(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>SRHI - Self-Report Habit Index</DialogTitle>
            <DialogDescription>
              Bewerte deine Gewohnheit anhand der folgenden Aussagen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {SRHI_QUESTIONS.map((question, index) => (
              <div key={index} className="space-y-2">
                <Label>{question}</Label>
                <RadioGroup
                  value={srhiRespon

ses[index]}
                  onValueChange={(value) =>
                    setSrhiResponses((prev) => ({ ...prev, [index]: value }))
                  }
                >
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id={`q${index}-1`} />
                      <Label htmlFor={`q${index}-1`}>Stimme nicht zu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id={`q${index}-2`} />
                      <Label htmlFor={`q${index}-2`}>Neutral</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3" id={`q${index}-3`} />
                      <Label htmlFor={`q${index}-3`}>Stimme zu</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            ))}
            <Textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Teile deine Gedanken..."
              className="h-32"
            />
            <Button 
              onClick={() => {
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
              className="w-full"
            >
              Reflexion abschließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};