
import { Navigation } from "@/components/layout/Navigation";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { TodoList } from "@/components/dashboard/TodoList";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const isMobile = useIsMobile();
  
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white transition-all duration-500">
      <Navigation />
      <main className="container max-w-7xl mx-auto py-8 md:py-12 px-4 md:px-6 animate-fade-in">
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <div className="space-y-3 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-800 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              Dein Fortschritt
            </h2>
            <p className="text-lg text-blue-600">
              Verfolge deine Entwicklung und erreiche deine Ziele
            </p>
          </div>
          <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow border-0 rounded-xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-blue-700">Gesamtfortschritt</span>
                <span className="text-lg font-bold text-blue-800">
                  {calculateOverallProgress()}%
                </span>
              </div>
              <Progress 
                value={calculateOverallProgress()} 
                className="h-3 bg-blue-100"
              />
              <p className="text-lg text-blue-600 flex items-center gap-2">
                Du bist auf einem guten Weg
                <ChevronRight className="h-5 w-5" />
              </p>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow border-0 rounded-xl">
            <HabitJourney />
          </Card>
          <Card className="p-8 bg-white shadow-lg hover:shadow-xl transition-shadow border-0 rounded-xl">
            <TodoList />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
