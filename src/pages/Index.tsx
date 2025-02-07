
import { Navigation } from "@/components/layout/Navigation";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { TodoList } from "@/components/dashboard/TodoList";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

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

  const { data: keystoneHabits } = useQuery({
    queryKey: ["keystone-habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("keystone_habits")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="animate-pulse text-purple-600">Loading...</div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 transition-all duration-500">
      <Navigation />
      <main className="container py-8 px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-purple-800 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
            Dein Fortschritt
          </h2>
          <div className="p-6 bg-white rounded-2xl shadow-lg backdrop-blur-sm border border-purple-100">
            <Progress 
              value={calculateOverallProgress()} 
              className="h-3 bg-purple-100"
            />
            <p className="mt-2 text-sm text-purple-600">
              {calculateOverallProgress()}% deiner Ziele erreicht
            </p>
          </div>
        </div>

        {keystoneHabits && keystoneHabits.length > 0 && (
          <div className="mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-purple-800">Deine Keystone Habits</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {keystoneHabits.map((habit) => (
                <Card key={habit.id} className="p-4 bg-white shadow-lg border border-purple-100">
                  <h3 className="font-semibold text-purple-800 mb-2">{habit.habit_name}</h3>
                  <p className="text-sm text-purple-600 mb-2">{habit.description}</p>
                  <div className="text-xs text-purple-500">
                    <span className="font-medium">Lebensbereich:</span> {habit.life_area}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
            <HabitJourney />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
            <TodoList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
