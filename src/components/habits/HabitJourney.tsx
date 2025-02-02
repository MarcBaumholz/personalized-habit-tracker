import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Target, Award } from "lucide-react";

export const HabitJourney = () => {
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

  const calculateOverallProgress = () => {
    if (!habits || habits.length === 0) return 0;
    const totalProgress = habits.reduce((sum, habit) => {
      const completions = habit.habit_completions?.length || 0;
      return sum + (completions / 66);
    }, 0);
    return Math.round((totalProgress / habits.length) * 100);
  };

  const getLevel = () => {
    const progress = calculateOverallProgress();
    return Math.floor(progress / 10) + 1;
  };

  const getMilestones = () => {
    const completedHabits = habits?.filter(
      (habit: any) => (habit.habit_completions?.length || 0) >= 66
    ) || [];
    return completedHabits.length;
  };

  return (
    <Card className="p-6 bg-white">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Deine Habit Journey</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Level</p>
            <p className="text-2xl font-bold">{getLevel()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Gesamtfortschritt</p>
            <p className="text-2xl font-bold">{calculateOverallProgress()}%</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Automatisierte Habits</p>
            <p className="text-2xl font-bold">{getMilestones()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {habits?.map((habit: any) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{habit.name}</span>
              <span className="text-gray-600">
                {habit.habit_completions?.length || 0}/66 Tage
              </span>
            </div>
            <Progress 
              value={(habit.habit_completions?.length || 0) / 66 * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};