import { Navigation } from "@/components/layout/Navigation";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { TodoList } from "@/components/dashboard/TodoList";
import { ProgressStats } from "@/components/dashboard/ProgressStats";
import { DashboardOverview } from "@/components/habits/DashboardOverview";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="space-y-6">
          <ProgressStats />
          <div className="grid gap-6 md:grid-cols-2">
            <TodoList />
            <HabitTracker />
          </div>
          <DashboardOverview />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;