import { Navigation } from "@/components/layout/Navigation";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { TodoList } from "@/components/dashboard/TodoList";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

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
    return <div>Loading...</div>;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Gesamtfortschritt</h2>
          <Progress value={calculateOverallProgress()} className="h-2" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <HabitJourney />
          <TodoList />
        </div>
      </main>
    </div>
  );
};

export default Index;