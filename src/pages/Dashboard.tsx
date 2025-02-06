
import { Navigation } from "@/components/layout/Navigation";
import { DashboardOverview } from "@/components/habits/DashboardOverview";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { YearlyActivity } from "@/components/dashboard/YearlyActivity";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <YearlyActivity />
        <div className="mt-6">
          <HabitJourney />
        </div>
        <div className="mt-6">
          <DashboardOverview />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
