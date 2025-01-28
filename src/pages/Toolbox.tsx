import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, Calendar, Users, Plus } from "lucide-react";

const Toolbox = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Habit Baukasten</h1>

        <Tabs defaultValue="templates" className="space-y-6">
          <TabsList>
            <TabsTrigger value="templates">Vorlagen</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="personal">Persönlich</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Morgenroutine",
                  description: "Optimaler Start in den Tag",
                  icon: Calendar,
                  habits: ["Meditation", "Bewegung", "Journaling"],
                },
                {
                  title: "Fokussierte Arbeit",
                  description: "Maximale Produktivität",
                  icon: Brain,
                  habits: ["Deep Work", "Pomodoro", "Reflexion"],
                },
                {
                  title: "Gesunde Balance",
                  description: "Work-Life-Balance",
                  icon: Target,
                  habits: ["Sport", "Entspannung", "Hobbys"],
                },
                {
                  title: "Soziale Verbindungen",
                  description: "Beziehungen stärken",
                  icon: Users,
                  habits: ["Networking", "Familie", "Freunde"],
                },
              ].map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.title} className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{template.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {template.habits.map((habit) => (
                        <div
                          key={habit}
                          className="flex items-center justify-between p-2 bg-secondary/20 rounded"
                        >
                          <span className="text-sm">{habit}</span>
                          <Button size="sm" variant="ghost">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Community Gewohnheiten</h2>
              <p className="text-muted-foreground">
                Entdecke erfolgreiche Gewohnheiten aus der Community
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Deine Gewohnheiten</h2>
              <p className="text-muted-foreground">
                Verwalte und organisiere deine persönlichen Gewohnheiten
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Toolbox;