
import { Navigation } from "@/components/layout/Navigation";
import { DashboardOverview } from "@/components/habits/DashboardOverview";
import { AdvancedAnalytics } from "@/components/dashboard/AdvancedAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <main className="container px-4 md:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="w-full grid grid-cols-2 p-1 bg-blue-100/50 rounded-xl">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg px-8 py-3 text-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md transition-all"
            >
              Übersicht
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="rounded-lg px-8 py-3 text-lg data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md transition-all"
            >
              Erweiterte Analyse
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="analytics" className="animate-fade-in">
            <AdvancedAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
