import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { CategoryDistribution } from "@/components/dashboard/CategoryDistribution";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { YearlyActivity } from "@/components/dashboard/YearlyActivity";
import { HabitProgress } from "@/components/dashboard/HabitProgress";
import { calculateStreak, calculateSuccessRate, calculateActiveDays, calculateTotalProgress, generateWeeklyData, generateCategoryData, generateProgressData, generateYearlyActivity } from "@/utils/habitStats";

export const DashboardOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ["habit-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: completions } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", user.id);

      const { data: habits } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);

      return {
        streak: calculateStreak(completions || []),
        successRate: calculateSuccessRate(completions || [], habits || []),
        activeDays: calculateActiveDays(completions || []),
        totalProgress: calculateTotalProgress(completions || [], habits || []),
        weeklyData: generateWeeklyData(completions || []),
        categoryData: generateCategoryData(habits || [], completions || []),
        progressData: generateProgressData(completions || []),
        yearlyActivity: generateYearlyActivity(completions || []),
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dein Fortschritt</h1>
      
      <MetricCards
        streak={stats?.streak || 0}
        successRate={stats?.successRate || 0}
        activeDays={stats?.activeDays || 0}
        totalProgress={stats?.totalProgress || 0}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryDistribution data={stats?.categoryData || []} />
        <WeeklyProgress data={stats?.weeklyData || []} />
      </div>

      <YearlyActivity data={stats?.yearlyActivity || []} />
      
      <HabitProgress data={stats?.progressData || []} />
    </div>
  );
};