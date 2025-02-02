import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Award, Users, Brain, Target, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const courses = [
  {
    title: "Gewohnheiten verstehen",
    description: "Die wissenschaftlichen Grundlagen der Gewohnheitsbildung",
    icon: Brain,
    duration: "5 Tage",
    modules: [
      "Die Anatomie einer Gewohnheit",
      "Der Habit Loop",
      "Trigger identifizieren",
      "Belohnungssysteme verstehen",
      "Implementation Intentions"
    ],
    progress: 60
  },
  {
    title: "Keystone Habits",
    description: "Identifiziere und entwickle Schlüsselgewohnheiten",
    icon: Target,
    duration: "7 Tage",
    modules: [
      "Was sind Keystone Habits?",
      "Deep Work als Keystone Habit",
      "Meditation als Keystone Habit",
      "Kleine Gewohnheiten, große Wirkung",
      "Habit Stacking Methode"
    ],
    progress: 30
  },
  {
    title: "Habit Tracking Mastery",
    description: "Effektives Tracking und Reflexion von Gewohnheiten",
    icon: Calendar,
    duration: "5 Tage",
    modules: [
      "Tracking Systeme verstehen",
      "Die Seinfeld Methode",
      "Digitale vs. analoge Tracker",
      "Reflexionsroutinen etablieren",
      "Anpassung und Optimierung"
    ],
    progress: 0
  }
];

const Education = () => {
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
                    <p className="text-sm text-primary mt-1">{course.duration}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {course.modules.map((module, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center mr-2">
                        {index + 1}
                      </div>
                      {module}
                    </div>
                  ))}
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