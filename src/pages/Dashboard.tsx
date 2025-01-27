import { Navigation } from "@/components/layout/Navigation";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { WeeklyReflection } from "@/components/habits/WeeklyReflection";
import { HabitEducation } from "@/components/habits/HabitEducation";
import { DashboardOverview } from "@/components/habits/DashboardOverview";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <DashboardOverview />
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="space-y-6">
            <HabitTracker />
            <HabitEducation />
          </div>
          <WeeklyReflection />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;