import { useEffect } from "react";
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

const Dashboard = () => {
  const { userProfile } = useUser();

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
          <MetricCards />
        </div>

        <div className="mt-8">
          <YearlyActivity />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <TodoHeader />
            <TodoList />
          </div>
          <div className="space-y-6">
            <ProgressStats />
            <HabitProgress />
            <CategoryDistribution />
            <WeeklyProgress />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
