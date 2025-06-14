import { Navigation } from "@/components/layout/Navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Target, Calendar, List, BookOpen, Clock, Lightbulb, Package, Users, Search, Filter, Plus, InfinityIcon } from "lucide-react";
import { ToolboxHeader } from "@/components/toolbox/ToolboxHeader";
import { ToolboxCarousel } from "@/components/toolbox/ToolboxCarousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Award, CheckCircle2, Info, Video, Star } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { CommunityChallenges } from "@/components/community/CommunityChallenges";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  is_favorite?: boolean;
}

interface InspirationToolkit {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  example: string;
  steps: string[];
  cue?: string;
  craving?: string;
  routine?: string;
  reward?: string;
  minimal_dose?: string;
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

const INSPIRATION_TOOLKITS: InspirationToolkit[] = [
  {
    id: "morning-routine",
    title: "Morgenroutine",
    description: "Optimaler Start in den Tag",
    icon: Calendar,
    category: "Routine",
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
    category: "Produktivität",
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
    id: "hooked-model",
    title: "Hooked-Modell",
    description: "Entwickle gewohnheitsbildende Produkte nach Nir Eyal",
    icon: InfinityIcon,
    category: "Produktstrategie",
    example: "Analyse der Nutzergewohnheiten wie bei Social Media Apps",
    steps: [
      "Identifiziere Auslöser (extern & intern)",
      "Definiere eine einfache Aktion",
      "Biete variable Belohnungen",
      "Fordere eine Nutzerinvestition",
      "Analysiere mit der 5-Whys-Methode"
    ],
    cue: "Identifizierte Nutzerbedürfnisse",
    craving: "Wiederkehrende Nutzung deines Produkts",
    routine: "Hook-Zyklus implementieren",
    reward: "Loyale, gewohnheitsgesteuerte Nutzer",
    minimal_dose: "Ein minimaler Hook-Zyklus pro Feature"
  },
  {
    id: "habit-tracking",
    title: "Habit Tracking",
    description: "Gewohnheiten systematisch verfolgen",
    icon: List,
    category: "Organisation",
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
    category: "Organisation",
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
    category: "Produktivität",
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
    category: "Produktivität",
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
    category: "Bildung",
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
    category: "Kreativität",
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
  const [activeTab, setActiveTab] = useState<'inspiration' | 'community'>('inspiration');
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const { data: favoriteToolkits } = useQuery({
    queryKey: ["favorite-toolkits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get favorite habits
      const { data: favoriteHabits } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("user_id", user.id)
        .eq("is_favorite", true)
        .order("created_at", { ascending: false });

      // Get favorite building blocks
      const { data: favoriteBlocks } = await supabase
        .from("building_blocks")
        .select("*")
        .eq("is_favorite", true)
        .order("created_at", { ascending: false });

      // Format building blocks to match the same structure as habits
      const formattedBlocks = (favoriteBlocks || []).map(block => ({
        ...block,
        type: 'building_block',
        title: block.name,
        steps: block.impact_area,
      }));

      // Combine both types of favorites
      return [...(favoriteHabits || []), ...formattedBlocks];
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
      case 'inspiration':
        return INSPIRATION_TOOLKITS;
      case 'community':
        return []; // Will be implemented later
      default:
        return [];
    }
  };
  
  const filteredInspiration = INSPIRATION_TOOLKITS.filter(toolkit => 
    toolkit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toolkit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    toolkit.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToolkitToProfile = async (toolkit: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const habitData = {
        user_id: user.id,
        name: toolkit.title || toolkit.name,
        category: toolkit.category || "routine",
        cue: toolkit.cue,
        craving: toolkit.craving,
        routine: toolkit.routine,
        reward: toolkit.reward,
        minimal_dose: toolkit.minimal_dose,
        building_blocks: toolkit.building_blocks,
        is_favorite: true, // Set new tools as favorites by default
      };

      await supabase.from("habits").insert(habitData);

      queryClient.invalidateQueries({ queryKey: ["active-routines"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-toolkits"] });

      toast({
        title: "Routine hinzugefügt",
        description: `${toolkit.title || toolkit.name} wurde zu deinen Routinen hinzugefügt.`,
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
      queryClient.invalidateQueries({ queryKey: ["favorite-toolkits"] });

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
        {activeTab === 'community' ? 'Community Challenges' : 'Toolbox'}
      </h1>
      <TabsList className="bg-blue-100/50 rounded-xl p-1">
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
      </TabsList>
    </div>
  );

  const InspirationCard = ({ toolkit }: { toolkit: InspirationToolkit }) => {
    const Icon = toolkit.icon;
    
    return (
      <Card className="p-6 hover:shadow-md transition-shadow border border-blue-100/60 cursor-pointer h-full">
        <div className="flex flex-col h-full">
          <div className="mb-4 flex justify-between items-start">
            <div>
              <Badge variant="outline" className="mb-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200">
                {toolkit.category}
              </Badge>
              <h3 className="font-bold text-xl text-gray-800 mb-1">{toolkit.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{toolkit.description}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          {toolkit.example && (
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Beispiel:</span> {toolkit.example}
              </p>
            </div>
          )}

          <div className="space-y-2 mb-auto">
            <h4 className="font-medium text-gray-700 text-sm">Schritte zur Umsetzung:</h4>
            <ul className="list-disc text-sm space-y-1 pl-5 text-gray-600">
              {toolkit.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>

          {(toolkit.cue || toolkit.routine || toolkit.reward) && (
            <div className="bg-blue-50 p-3 rounded-md my-4 text-sm">
              <h4 className="font-medium text-gray-700 mb-2">Habit Loop:</h4>
              <div className="grid grid-cols-2 gap-2">
                {toolkit.cue && (
                  <div>
                    <span className="font-medium">Auslöser:</span> {toolkit.cue}
                  </div>
                )}
                {toolkit.craving && (
                  <div>
                    <span className="font-medium">Verlangen:</span> {toolkit.craving}
                  </div>
                )}
                {toolkit.routine && (
                  <div>
                    <span className="font-medium">Routine:</span> {toolkit.routine}
                  </div>
                )}
                {toolkit.reward && (
                  <div>
                    <span className="font-medium">Belohnung:</span> {toolkit.reward}
                  </div>
                )}
              </div>
              {toolkit.minimal_dose && (
                <div className="mt-2">
                  <span className="font-medium">Minimale Dosis:</span> {toolkit.minimal_dose}
                </div>
              )}
            </div>
          )}

          <Button 
            className="mt-4 w-full"
            onClick={() => addToolkitToProfile(toolkit)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Zu meinen Routinen hinzufügen
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
            <TabsHeader />
            
            <TabsContent value="inspiration" className="animate-fade-in">
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Inspiration durchsuchen..."
                      className="pl-9 w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    {/* Filter and add button remain for inspiration search */}
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Eigene Routine erstellen
                    </Button>
                  </div>
                </div>
                
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl mb-6">Inspirationen für deine Gewohnheiten</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredInspiration.length > 0 ? (
                        filteredInspiration.map((toolkit) => (
                          <InspirationCard key={toolkit.id} toolkit={toolkit} />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-8">
                          <p className="text-gray-500">Keine Inspiration gefunden.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="community" className="animate-fade-in">
              <div className="py-6 sm:py-10">
                <CommunityChallenges />
              </div>
            </TabsContent>
            {/* Remove other TabsContent */}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Toolbox;
