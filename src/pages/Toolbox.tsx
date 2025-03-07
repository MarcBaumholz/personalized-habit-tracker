
import { Navigation } from "@/components/layout/Navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Target, Calendar, List, BookOpen, Clock, Lightbulb, Package } from "lucide-react";
import { ToolboxHeader } from "@/components/toolbox/ToolboxHeader";
import { ToolboxCarousel } from "@/components/toolbox/ToolboxCarousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Award, CheckCircle2, Info, Users, Video } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { CommunityChallenges } from "@/components/community/CommunityChallenges";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

interface BuildingBlock {
  id: string;
  name: string;
  description: string | null;
  category: string;
  impact_area: string[];
  created_at: string;
}

const courses = [
  {
    title: "Gewohnheiten verstehen",
    description: "Die wissenschaftlichen Grundlagen der Gewohnheitsbildung",
    icon: Brain,
    duration: "5 Tage",
    difficulty: "Anfänger",
    learningGoals: [
      "Verstehe die Anatomie einer Gewohnheit",
      "Lerne den Habit Loop kennen",
      "Identifiziere deine Trigger",
      "Entwickle effektive Belohnungssysteme"
    ],
    modules: [
      {
        title: "Die Anatomie einer Gewohnheit",
        duration: "20 Minuten",
        isCompleted: false,
        content: `
          <h3 class="text-xl font-semibold mb-4">Was ist eine Gewohnheit?</h3>
          <p class="mb-6">Eine Gewohnheit ist ein automatisiertes Verhaltensmuster, das durch regelmäßige Wiederholung entstanden ist.</p>
          
          <h3 class="text-xl font-semibold mb-4">Die vier Komponenten:</h3>
          <ul class="space-y-4 mb-6">
            <li class="flex items-start">
              <span class="bg-purple-100 p-2 rounded-full mr-3 mt-1">1</span>
              <div>
                <strong class="block text-lg mb-1">Trigger</strong>
                <p>Was löst das Verhalten aus?</p>
              </div>
            </li>
            <li class="flex items-start">
              <span class="bg-purple-100 p-2 rounded-full mr-3 mt-1">2</span>
              <div>
                <strong class="block text-lg mb-1">Verlangen</strong>
                <p>Welches Bedürfnis steckt dahinter?</p>
              </div>
            </li>
            <li class="flex items-start">
              <span class="bg-purple-100 p-2 rounded-full mr-3 mt-1">3</span>
              <div>
                <strong class="block text-lg mb-1">Routine</strong>
                <p>Was tue ich konkret?</p>
              </div>
            </li>
            <li class="flex items-start">
              <span class="bg-purple-100 p-2 rounded-full mr-3 mt-1">4</span>
              <div>
                <strong class="block text-lg mb-1">Belohnung</strong>
                <p>Welchen Nutzen ziehe ich daraus?</p>
              </div>
            </li>
          </ul>

          <div class="bg-purple-50 p-6 rounded-lg mb-6">
            <h4 class="text-lg font-semibold mb-3">Praktische Übung:</h4>
            <p>Analysiere eine deiner bestehenden Gewohnheiten nach diesem Schema.</p>
          </div>
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

const INSPIRATION_TOOLKITS = [
  {
    id: "morning-routine",
    title: "Morgenroutine",
    description: "Optimaler Start in den Tag",
    icon: Calendar,
    example: "Meditation um 6:00 Uhr für 10 Minuten",
    steps: [
      "Wähle eine feste Uhrzeit",
      "Bereite deine Umgebung vor",
      "Starte mit 5-10 Minuten",
    ],
    cue: "Nach dem Aufwachen",
    craving: "Einen ruhigen, fokussierten Start in den Tag",
    routine: "10 Minuten Meditation",
    reward: "Klarheit und innere Ruhe",
    minimal_dose: "2 Minuten achtsames Atmen",
  },
  {
    id: "deep-work",
    title: "Deep Work",
    description: "Maximale Produktivität durch fokussierte Arbeit",
    icon: Brain,
    example: "2 Stunden fokussierte Arbeit ohne Ablenkungen",
    steps: [
      "Blocke feste Zeiten",
      "Eliminiere Ablenkungen",
      "Setze klare Ziele",
    ],
    cue: "Morgens nach dem ersten Kaffee",
    craving: "Produktiver und effektiver arbeiten",
    routine: "90 Minuten fokussierte Arbeit",
    reward: "Sichtbare Fortschritte und Erfolgserlebnisse",
    minimal_dose: "25 Minuten Pomodoro-Session",
  },
  {
    id: "habit-tracking",
    title: "Habit Tracking",
    description: "Gewohnheiten systematisch verfolgen",
    icon: List,
    example: "Tägliches Tracking in einer Habit-Matrix",
    steps: [
      "Definiere messbare Kriterien",
      "Nutze ein Tracking-System",
      "Überprüfe regelmäßig deinen Fortschritt",
    ],
  },
  {
    id: "para-method",
    title: "PARA Methode",
    description: "Digitale Organisation",
    icon: Package,
    example: "Projekte, Areas, Ressourcen, Archive",
    steps: [
      "Kategorisiere deine Informationen",
      "Erstelle klare Strukturen",
      "Pflege regelmäßige Reviews",
    ],
  },
  {
    id: "habit-stacking",
    title: "Habit Stacking",
    description: "Gewohnheiten verknüpfen",
    icon: Package,
    example: "Nach dem Aufwachen direkt Wasser trinken",
    steps: [
      "Identifiziere bestehende Gewohnheiten",
      "Verknüpfe neue Gewohnheiten",
      "Starte klein und erweitere schrittweise",
    ],
  },
  {
    id: "timeboxing",
    title: "Timeboxing",
    description: "Zeitblöcke effektiv nutzen",
    icon: Clock,
    example: "45 Minuten fokussierte Arbeit + 15 Minuten Pause",
    steps: [
      "Plane deine Zeitblöcke im Voraus",
      "Setze realistische Zeitlimits",
      "Halte dich an die geplanten Zeiten",
    ],
  },
  {
    id: "knowledge-management",
    title: "Wissensmanagement",
    description: "Systematisches Lernen",
    icon: BookOpen,
    example: "Tägliche Lernnotizen in einem Second Brain",
    steps: [
      "Erfasse neue Erkenntnisse sofort",
      "Organisiere dein Wissen strukturiert",
      "Wende das Gelernte aktiv an",
    ],
  },
  {
    id: "creative-routine",
    title: "Kreative Routine",
    description: "Inspiration und Kreativität fördern",
    icon: Lightbulb,
    example: "Tägliches Brainstorming",
    steps: [
      "Schaffe eine inspirierende Umgebung",
      "Experimentiere mit verschiedenen Techniken",
      "Dokumentiere deine Ideen",
    ],
  },
];

const Toolbox = () => {
  const [selectedToolkit, setSelectedToolkit] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'routines' | 'community' | 'inspiration' | 'education'>('routines');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeRoutines } = useQuery({
    queryKey: ["active-routines"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      return data || [];
    },
  });

  const { data: buildingBlocks } = useQuery<BuildingBlock[]>({
    queryKey: ["building-blocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('building_blocks')
        .select('*')
        .order('category');
      
      if (error) throw error;
      return (data as BuildingBlock[]) || [];
    },
  });

  const getActiveToolkits = () => {
    switch (activeTab) {
      case 'routines':
        return activeRoutines || [];
      case 'building-blocks':
        return buildingBlocks || [];
      case 'inspiration':
        return INSPIRATION_TOOLKITS;
      case 'community':
        return []; // Will be implemented later
      case 'education':
        return []; // No toolkits for education tab
      default:
        return [];
    }
  };

  const addToolkitToProfile = async (toolkit: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const habitData = {
        user_id: user.id,
        name: toolkit.title,
        category: toolkit.category || "routine",
        cue: toolkit.cue,
        craving: toolkit.craving,
        routine: toolkit.routine,
        reward: toolkit.reward,
        minimal_dose: toolkit.minimal_dose,
        building_blocks: toolkit.building_blocks,
      };

      await supabase.from("habits").insert(habitData);

      queryClient.invalidateQueries({ queryKey: ["active-routines"] });

      toast({
        title: "Routine hinzugefügt",
        description: `${toolkit.title} wurde zu deinen Routinen hinzugefügt.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Routine konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  const removeRoutine = async (routineId: string) => {
    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", routineId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["active-routines"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });

      toast({
        title: "Routine entfernt",
        description: "Die Routine wurde erfolgreich entfernt.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Routine konnte nicht entfernt werden.",
        variant: "destructive",
      });
    }
  };

  const handleStartCourse = (course: any) => {
    if (course.progress > 0) {
      sonnerToast.success("Kurs wird fortgesetzt", {
        description: `Du bist bereits bei ${course.progress}% im Kurs "${course.title}"`,
      });
    } else {
      sonnerToast.success("Kurs wurde gestartet", {
        description: `Viel Erfolg beim Kurs "${course.title}"!`,
      });
    }
  };

  const handleModuleClick = (module: any) => {
    setSelectedModule(module);
  };

  const handleCompleteModule = (e: React.MouseEvent) => {
    e.stopPropagation();
    sonnerToast.success("Modul abgeschlossen!", {
      description: "Gut gemacht! Mach weiter so!",
    });
  };

  const TabsHeader = () => (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-2xl font-bold text-blue-800">
        {activeTab === 'education' ? 'Lernbereich' : 
         activeTab === 'community' ? 'Community Challenges' : 'Toolbox'}
      </h1>
      <TabsList className="bg-blue-100/50 rounded-xl p-1">
        <TabsTrigger
          value="routines"
          className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
        >
          Routinen
        </TabsTrigger>
        <TabsTrigger
          value="inspiration"
          className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
        >
          Inspiration
        </TabsTrigger>
        <TabsTrigger
          value="community"
          className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
        >
          Community
        </TabsTrigger>
        <TabsTrigger
          value="education"
          className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
        >
          Lernbereich
        </TabsTrigger>
      </TabsList>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
            <TabsHeader />
            
            <TabsContent value="routines" className="animate-fade-in">
              <div className="relative py-6 sm:py-10">
                <ToolboxCarousel
                  toolkits={getActiveToolkits()}
                  onSelect={setSelectedToolkit}
                  onRemove={removeRoutine}
                  onAdd={addToolkitToProfile}
                  activeTab={activeTab}
                />
              </div>

              <div className="mt-8 flex justify-center">
                <AddHabitDialog />
              </div>
            </TabsContent>
            
            <TabsContent value="inspiration" className="animate-fade-in">
              <div className="relative py-6 sm:py-10">
                <ToolboxCarousel
                  toolkits={getActiveToolkits()}
                  onSelect={setSelectedToolkit}
                  onRemove={removeRoutine}
                  onAdd={addToolkitToProfile}
                  activeTab={activeTab}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="community" className="animate-fade-in">
              <div className="py-6 sm:py-10">
                <CommunityChallenges />
              </div>
            </TabsContent>
            
            <TabsContent value="education" className="animate-fade-in">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <p className="text-lg text-gray-600">
                  Entdecke fundiertes Wissen zur Gewohnheitsbildung und entwickle dich weiter
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {courses.map((course) => {
                  const Icon = course.icon;
                  return (
                    <Card key={course.title} className="p-8 hover:shadow-xl transition-shadow duration-300 border border-blue-100/50">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm">
                          <Icon className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{course.title}</h3>
                          <p className="text-base text-gray-600">{course.description}</p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between text-base text-gray-600 mb-4">
                          <span className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {course.difficulty}
                          </span>
                        </div>

                        {course.modules.map((module, index) => (
                          <Dialog key={index}>
                            <DialogTrigger asChild>
                              <button 
                                className="flex items-center justify-between w-full p-4 hover:bg-blue-50 rounded-xl transition-colors text-left group"
                                onClick={() => handleModuleClick(module)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full border-2 border-blue-200 flex items-center justify-center group-hover:border-blue-400">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800">{module.title}</p>
                                    <p className="text-sm text-gray-500">{module.duration}</p>
                                  </div>
                                </div>
                                {module.isCompleted ? (
                                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                                ) : (
                                  <Info className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
                                )}
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">{module.title}</DialogTitle>
                                <DialogDescription>{module.duration}</DialogDescription>
                              </DialogHeader>
                              <div 
                                className="prose prose-blue max-w-none"
                                dangerouslySetInnerHTML={{ __html: module.content }}
                              />
                              <div className="flex justify-end mt-6">
                                <Button 
                                  onClick={handleCompleteModule}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  size="lg"
                                >
                                  <CheckCircle2 className="h-5 w-5 mr-2" />
                                  Als abgeschlossen markieren
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-base mb-2">
                            <span>Fortschritt</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress 
                            value={course.progress} 
                            className="h-2 bg-blue-100"
                          />
                        </div>
                        
                        <Button 
                          className="w-full group shadow-sm"
                          variant={course.progress > 0 ? "outline" : "default"}
                          size="lg"
                          onClick={() => handleStartCourse(course)}
                        >
                          {course.progress > 0 ? "Fortsetzen" : "Jetzt starten"}
                          <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Card className="p-8 bg-gradient-to-br from-blue-50 to-white border border-blue-100/50">
                <div className="flex items-center gap-6 mb-8">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow-sm">
                    <Award className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">Deine Lernfortschritte</h2>
                    <p className="text-lg text-gray-600">
                      Tracking deiner Entwicklung und Zertifikate
                    </p>
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm">
                    <h4 className="font-medium mb-2 text-gray-600">Abgeschlossene Kurse</h4>
                    <p className="text-3xl font-bold text-blue-600">2</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm">
                    <h4 className="font-medium mb-2 text-gray-600">Lernstunden</h4>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm">
                    <h4 className="font-medium mb-2 text-gray-600">Zertifikate</h4>
                    <p className="text-3xl font-bold text-blue-600">1</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Toolbox;
