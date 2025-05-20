
import { Navigation } from "@/components/layout/Navigation";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { TodoList } from "@/components/dashboard/TodoList";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { SubscribedChallenges } from "@/components/community/SubscribedChallenges";

const Index = () => {
  const { data: hasCompletedOnboarding, isLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", user.id);

      return (data?.length || 0) >= 6;
    },
  });

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

  const calculateOverallProgress = () => {
    if (!habits) return 0;
    const totalCompletions = habits.reduce((sum, habit) => 
      sum + (habit.habit_completions?.length || 0), 0);
    return Math.round((totalCompletions / (habits.length * 66)) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container max-w-7xl mx-auto py-6 px-4">
        {/* Clean, smaller progress section */}
        <Card className="mb-6 p-4 shadow-sm border-0 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-700">Fortschritt</span>
            <span className="font-bold text-blue-800">{calculateOverallProgress()}%</span>
          </div>
          <Progress 
            value={calculateOverallProgress()} 
            className="h-2 bg-blue-100 mt-2"
          />
        </Card>

        {/* Community Challenges section */}
        <Card className="mb-6 p-4 shadow-sm border-0 rounded-lg">
          <SubscribedChallenges />
        </Card>

        {/* Two-column layout with habits and todos */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-5 shadow-sm border-0 rounded-lg">
            <HabitJourney />
          </Card>
          <Card className="p-5 shadow-sm border-0 rounded-lg">
            <TodoList />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
