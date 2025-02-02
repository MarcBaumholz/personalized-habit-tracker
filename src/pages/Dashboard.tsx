import { DashboardOverview } from "@/components/habits/DashboardOverview";
import { MotivationalStats } from "@/components/dashboard/MotivationalStats";
import { SurpriseAnimation } from "@/components/feedback/SurpriseAnimation";
import { useSurpriseAnimation } from "@/hooks/useSurpriseAnimation";

const Dashboard = () => {
  const { animations, triggerAnimation } = useSurpriseAnimation();

  return (
    <div 
      className="container py-6 space-y-6"
      onClick={triggerAnimation}
    >
      {animations.map(({ id, x, y }) => (
        <SurpriseAnimation key={id} position={{ x, y }} />
      ))}
      
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardOverview />
        <MotivationalStats />
      </div>
    </div>
  );
};

export default Dashboard;