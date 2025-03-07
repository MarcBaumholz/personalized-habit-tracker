
import { Navigation } from "@/components/layout/Navigation";
import { HabitJourney } from "@/components/habits/HabitJourney";
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
      <main className="container max-w-5xl mx-auto py-8 px-4">
        {/* Progress Section - Simplified */}
        <Card className="mb-8 p-6 shadow-sm border-0 bg-blue-50 rounded-xl">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-blue-800">Dein Fortschritt</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-700">Gesamtfortschritt</span>
              <span className="font-bold text-blue-800">{calculateOverallProgress()}%</span>
            </div>
            <Progress 
              value={calculateOverallProgress()} 
              className="h-2 bg-blue-100"
            />
            <p className="text-blue-600 flex items-center gap-1 text-sm">
              Du bist auf einem guten Weg
              <ChevronRight className="h-4 w-4" />
            </p>
          </div>
        </Card>

        {/* Main Content - Focus on Habits only */}
        <div className="space-y-8">
          <Card className="p-6 shadow-sm border-0 rounded-xl">
            <HabitJourney />
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
