import { Navigation } from "@/components/layout/Navigation";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { WeeklyReflection } from "@/components/habits/WeeklyReflection";
import { HabitEducation } from "@/components/habits/HabitEducation";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="grid gap-6 md:grid-cols-2">
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