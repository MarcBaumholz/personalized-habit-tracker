
import { Navigation } from "@/components/layout/Navigation";
import { DashboardOverview } from "@/components/habits/DashboardOverview";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { YearlyActivity } from "@/components/dashboard/YearlyActivity";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="space-y-6">
          <HabitJourney />
          <DashboardOverview />
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Jahresübersicht</h2>
            <YearlyActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
