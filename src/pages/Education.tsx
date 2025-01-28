import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Award, Users } from "lucide-react";

const Education = () => {
  const courses = [
    {
      title: "Gewohnheiten erfolgreich etablieren",
      description: "Lerne die wissenschaftlichen Grundlagen der Gewohnheitsbildung",
      icon: BookOpen,
      progress: 60,
    },
    {
      title: "ZRM Grundlagen",
      description: "Verstehe die Prinzipien des Zürcher Ressourcen Modells",
      icon: Video,
      progress: 30,
    },
    {
      title: "Community Best Practices",
      description: "Erfolgsgeschichten und Tipps aus der Community",
      icon: Users,
      progress: 0,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Lernbereich</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <Card key={course.title} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.description}</p>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full mb-4">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <Button className="w-full" variant={course.progress > 0 ? "outline" : "default"}>
                  {course.progress > 0 ? "Fortsetzen" : "Starten"}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Award className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Deine Lernfortschritte</h2>
              <p className="text-muted-foreground">
                Tracking deiner Entwicklung und Zertifikate
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h4 className="font-medium mb-1">Abgeschlossene Kurse</h4>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h4 className="font-medium mb-1">Lernstunden</h4>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg">
              <h4 className="font-medium mb-1">Zertifikate</h4>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Education;