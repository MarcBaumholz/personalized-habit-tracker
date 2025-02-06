
import { Navigation } from "@/components/layout/Navigation";
import { DashboardOverview } from "@/components/habits/DashboardOverview";
import { HabitJourney } from "@/components/habits/HabitJourney";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <HabitJourney />
        <DashboardOverview />
      </main>
    </div>
  );
};

export default Dashboard;
