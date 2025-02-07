
import { Navigation } from "@/components/layout/Navigation";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { TodoList } from "@/components/dashboard/TodoList";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white transition-all duration-500">
      <Navigation />
      <main className="container max-w-7xl mx-auto py-12 px-6 animate-fade-in">
        <div className="mb-12 max-w-3xl mx-auto">
          <div className="space-y-2 mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">
              Dein Fortschritt
            </h2>
            <p className="text-gray-600">
              Verfolge deine Entwicklung und erreiche deine Ziele
            </p>
          </div>
          <Card className="p-8 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Gesamtfortschritt</span>
                <span className="text-sm font-medium text-gray-800">
                  {calculateOverallProgress()}%
                </span>
              </div>
              <Progress 
                value={calculateOverallProgress()} 
                className="h-2 bg-gray-100"
              />
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Du bist auf einem guten Weg
                <ChevronRight className="h-4 w-4" />
              </p>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <Card className="p-8 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border-0 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]">
            <HabitJourney />
          </Card>
          <Card className="p-8 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border-0 transition-all duration-300 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)]">
            <TodoList />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
