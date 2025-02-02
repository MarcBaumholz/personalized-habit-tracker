import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Video, Award } from "lucide-react";

const Education = () => {
  const modules = [
    {
      title: "Grundlagen der Gewohnheitsbildung",
      description: "Lerne die wissenschaftlichen Grundlagen der Gewohnheitsbildung kennen.",
      progress: 80,
      icon: BookOpen,
    },
    {
      title: "Verhaltensänderung verstehen",
      description: "Verstehe die psychologischen Aspekte der Verhaltensänderung.",
      progress: 60,
      icon: Video,
    },
    {
      title: "Fortgeschrittene Techniken",
      description: "Entdecke fortgeschrittene Techniken zur Gewohnheitsbildung.",
      progress: 30,
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Education Center</h1>
            <p className="text-muted-foreground mt-2">
              Erweitere dein Wissen über Gewohnheitsbildung und persönliches Wachstum.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <module.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{module.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                  </div>
                  
                  <Progress value={module.progress} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {module.progress}% abgeschlossen
                    </span>
                    <Button size="sm">Fortfahren</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Dein Lernfortschritt</h2>
              <Progress value={60} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Du hast bereits 60% des Bildungsmaterials abgeschlossen. Weiter so!
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Education;