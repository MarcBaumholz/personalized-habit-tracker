import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, Award, Users, Brain, Target, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const courses = [
  {
    title: "Gewohnheiten verstehen",
    description: "Die wissenschaftlichen Grundlagen der Gewohnheitsbildung",
    icon: Brain,
    duration: "5 Tage",
    modules: [
      {
        title: "Die Anatomie einer Gewohnheit",
        content: `
          <h3>Was ist eine Gewohnheit?</h3>
          <p>Eine Gewohnheit ist ein automatisiertes Verhaltensmuster, das durch regelmäßige Wiederholung entstanden ist.</p>
          
          <h3>Die vier Komponenten:</h3>
          <ul>
            <li>Trigger (Was löst das Verhalten aus?)</li>
            <li>Verlangen (Welches Bedürfnis steckt dahinter?)</li>
            <li>Routine (Was tue ich konkret?)</li>
            <li>Belohnung (Welchen Nutzen ziehe ich daraus?)</li>
          </ul>

          <h3>Praktische Übung:</h3>
          <p>Analysiere eine deiner bestehenden Gewohnheiten nach diesem Schema.</p>
        `
      },
      {
        title: "Der Habit Loop",
        content: "Detaillierte Erklärung des Habit Loops..."
      },
      {
        title: "Trigger identifizieren",
        content: "Wie man effektive Trigger etabliert..."
      },
      {
        title: "Belohnungssysteme verstehen",
        content: "Die Rolle von Belohnungen..."
      },
      {
        title: "Implementation Intentions",
        content: "Konkrete Wenn-Dann-Pläne..."
      }
    ],
    progress: 60
  },
  {
    title: "Keystone Habits",
    description: "Identifiziere und entwickle Schlüsselgewohnheiten",
    icon: Target,
    duration: "7 Tage",
    modules: [
      {
        title: "Was sind Keystone Habits?",
        content: "Definition und Bedeutung..."
      },
      {
        title: "Deep Work als Keystone Habit",
        content: "Implementierung von Deep Work..."
      },
      {
        title: "Meditation als Keystone Habit",
        content: "Einstieg in die Meditation..."
      },
      {
        title: "Kleine Gewohnheiten, große Wirkung",
        content: "Die Kraft kleiner Veränderungen..."
      },
      {
        title: "Habit Stacking Methode",
        content: "Gewohnheiten verknüpfen..."
      }
    ],
    progress: 30
  },
  {
    title: "Habit Tracking Mastery",
    description: "Effektives Tracking und Reflexion von Gewohnheiten",
    icon: Calendar,
    duration: "5 Tage",
    modules: [
      {
        title: "Tracking Systeme verstehen",
        content: "Verschiedene Tracking-Methoden..."
      },
      {
        title: "Die Seinfeld Methode",
        content: "Don't break the chain..."
      },
      {
        title: "Digitale vs. analoge Tracker",
        content: "Vor- und Nachteile..."
      },
      {
        title: "Reflexionsroutinen etablieren",
        content: "Regelmäßige Selbstreflexion..."
      },
      {
        title: "Anpassung und Optimierung",
        content: "Kontinuierliche Verbesserung..."
      }
    ],
    progress: 0
  }
];

const Education = () => {
  const [selectedModule, setSelectedModule] = useState<any>(null);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container py-6">
        <h1 className="text-2xl font-bold mb-6">Lernbereich</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <Card key={course.title} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Icon className="h-6 w-6 text-gray-900" />
                  </div>
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                    <p className="text-sm text-gray-900 mt-1">{course.duration}</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {course.modules.map((module, index) => (
                    <Dialog key={index}>
                      <DialogTrigger asChild>
                        <button 
                          className="flex items-center text-sm w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          onClick={() => setSelectedModule(module)}
                        >
                          <div className="w-5 h-5 rounded-full border border-gray-900 flex items-center justify-center mr-2">
                            {index + 1}
                          </div>
                          {module.title}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{module.title}</DialogTitle>
                        </DialogHeader>
                        <div 
                          className="prose prose-gray max-w-none"
                          dangerouslySetInnerHTML={{ __html: module.content }}
                        />
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>

                <div className="h-2 bg-gray-100 rounded-full mb-4">
                  <div
                    className="h-full bg-gray-900 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  variant={course.progress > 0 ? "outline" : "default"}
                >
                  {course.progress > 0 ? "Fortsetzen" : "Starten"}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Award className="h-8 w-8 text-gray-900" />
            <div>
              <h2 className="text-xl font-semibold">Deine Lernfortschritte</h2>
              <p className="text-gray-600">
                Tracking deiner Entwicklung und Zertifikate
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-1">Abgeschlossene Kurse</h4>
              <p className="text-2xl font-bold">2</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-1">Lernstunden</h4>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
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