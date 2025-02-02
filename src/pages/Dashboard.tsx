import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
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

  const calculateMetrics = () => {
    if (!habits) return { streak: 0, successRate: 0, activeDays: 0, progress: 0 };

    const totalCompletions = habits.reduce((sum, habit) => 
      sum + (habit.habit_completions?.length || 0), 0);
    
    const maxStreak = Math.max(...habits.map(h => h.streak_count || 0));
    const activeDays = new Set(habits.flatMap(h => 
      h.habit_completions?.map(c => c.completed_date) || []
    )).size;

    const totalPossibleDays = habits.length * 30; // Assuming 30 days per month
    const successRate = (totalCompletions / totalPossibleDays) * 100;
    const progress = (totalCompletions / (habits.length * 66)) * 100; // 66 days for habit formation

    return {
      streak: maxStreak,
      successRate: Math.round(successRate),
      activeDays,
      progress: Math.round(progress),
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Dein Fortschritt</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Trophy className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktuelle Streak</p>
              <p className="text-2xl font-bold">{metrics.streak} Tage</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Target className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Erfolgsquote</p>
              <p className="text-2xl font-bold">{metrics.successRate}%</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktive Tage</p>
              <p className="text-2xl font-bold">{metrics.activeDays}/30</p>
            </div>
          </Card>

          <Card className="p-4 flex items-center space-x-4">
            <div className="bg-gray-100 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Fortschritt</p>
              <p className="text-2xl font-bold">{metrics.progress}%</p>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Deine Gewohnheiten</h2>
            {/* Add habit charts and visualizations here */}
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Deine Todos</h2>
            {/* Add todo statistics and charts here */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;