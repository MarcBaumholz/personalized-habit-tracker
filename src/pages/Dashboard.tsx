
import { Navigation } from "@/components/layout/Navigation";
import { DashboardOverview } from "@/components/habits/DashboardOverview";
import { YearlyActivity } from "@/components/dashboard/YearlyActivity";
import { AdvancedAnalytics } from "@/components/dashboard/AdvancedAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="analytics">Erweiterte Analyse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
            <div className="mt-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Jahresübersicht</h2>
              <YearlyActivity />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
