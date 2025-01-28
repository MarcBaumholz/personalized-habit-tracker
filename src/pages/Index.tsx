import { Navigation } from "@/components/layout/Navigation";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { WeeklyReflection } from "@/components/habits/WeeklyReflection";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">Gesamtfortschritt zum Automatismus</h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Deep Work</span>
                <span>36/66 Tage</span>
              </div>
              <Progress value={54} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Meditation</span>
                <span>12/66 Tage</span>
              </div>
              <Progress value={18} />
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <HabitTracker />
          <WeeklyReflection />
        </div>
      </main>
    </div>
  );
};

export default Index;