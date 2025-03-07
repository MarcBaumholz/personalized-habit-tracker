
import { useEffect, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { useUser } from "@/hooks/use-user";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { TodoList } from "@/components/dashboard/TodoList";
import { TodoHeader } from "@/components/dashboard/TodoHeader";
import { ProgressStats } from "@/components/dashboard/ProgressStats";
import { HabitProgress } from "@/components/dashboard/HabitProgress";
import { CategoryDistribution } from "@/components/dashboard/CategoryDistribution";
import { WeeklyProgress } from "@/components/dashboard/WeeklyProgress";
import { YearlyActivity } from "@/components/dashboard/YearlyActivity";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { userProfile } = useUser();
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("--:--:--");

  // Calculate time until midnight
  useEffect(() => {
    const calculateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      return `${hours}h ${minutes}m ${seconds}s`;
    };
    
    // Update time initially
    setTimeUntilMidnight(calculateTimeUntilMidnight());
    
    // Update time every second
    const interval = setInterval(() => {
      setTimeUntilMidnight(calculateTimeUntilMidnight());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch habit data for components
  const { data: habitData } = useQuery({
    queryKey: ["dashboard-habit-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      // Fetch habits
      const { data: habits } = await supabase
        .from("habits")
        .select("id, name, category")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      // Fetch habit completions
      const { data: completions } = await supabase
        .from("habit_completions")
        .select("habit_id, created_at")
        .eq("user_id", user.id);
      
      // Calculate metrics
      const habitProgress = (habits || []).slice(0, 3).map(habit => {
        const habitCompletions = (completions || []).filter(c => c.habit_id === habit.id).length;
        return {
          id: habit.id,
          name: habit.name,
          completions: habitCompletions
        };
      });
      
      // Generate category distribution data
      const categories: Record<string, number> = {};
      (habits || []).forEach(habit => {
        const category = habit.category || "Uncategorized";
        if (!categories[category]) {
          categories[category] = 0;
        }
        categories[category]++;
      });
      
      const categoryData = Object.entries(categories).map(([name, value]) => ({
        name,
        value
      }));
      
      // Generate weekly progress data
      const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      const weeklyData = weekDays.map(day => {
        // This is simplified - in a real app you'd match actual days
        return {
          name: day,
          completions: Math.floor(Math.random() * 10) // Placeholder for demo
        };
      });
      
      return {
        habitProgress,
        categoryData,
        weeklyData,
        metrics: {
          streak: 7,
          successRate: 85,
          activeDays: 22,
          totalProgress: 65
        }
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    document.title = "Dashboard | HabitJourney";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <main className="container py-8 px-4 md:px-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Dashboard</h1>
        <p className="text-blue-600 mb-6">Willkommen zurück, {userProfile?.full_name || 'Nutzer'}!</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <MetricCards 
            streak={habitData?.metrics.streak || 0}
            successRate={habitData?.metrics.successRate || 0}
            activeDays={habitData?.metrics.activeDays || 0}
            totalProgress={habitData?.metrics.totalProgress || 0}
          />
        </div>

        <div className="mt-8">
          <YearlyActivity />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <TodoHeader timeUntilMidnight={timeUntilMidnight} />
            <TodoList />
          </div>
          <div className="space-y-6">
            <ProgressStats />
            <HabitProgress data={habitData?.habitProgress || []} />
            <CategoryDistribution data={habitData?.categoryData || []} />
            <WeeklyProgress data={habitData?.weeklyData || []} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
