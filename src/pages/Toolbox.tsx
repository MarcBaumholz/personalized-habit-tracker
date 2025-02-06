
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Brain, Target, Calendar, Plus, Users, Lightbulb, Package, List, BookOpen, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";
import { useQuery } from "@tanstack/react-query";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

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
  },
  {
    id: "deep-work",
    title: "Deep Work",
    description: "Maximale Produktivität",
    icon: Brain,
    example: "2 Stunden fokussierte Arbeit ohne Ablenkungen",
    steps: [
      "Blocke feste Zeiten",
      "Eliminiere Ablenkungen",
      "Setze klare Ziele",
    ],
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
  const [activeTab, setActiveTab] = useState<'routines' | 'community' | 'inspiration'>('routines');
  const { toast } = useToast();

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

  const addToolkitToProfile = async (toolkit: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await supabase.from("habits").insert({
        user_id: user.id,
        name: toolkit.title,
        category: "routine",
        context: JSON.stringify(toolkit),
      });

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

  const renderToolkit = (toolkit: any) => {
    const Icon = toolkit.icon || Calendar;
    return (
      <Card className="relative p-8 transition-all duration-300 h-[500px] flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <Icon className="h-8 w-8 text-gray-900" />
          </div>
          <div>
            <h3 className="text-xl font-medium">{toolkit.name || toolkit.title}</h3>
            <p className="text-gray-600">
              {toolkit.description || toolkit.category}
            </p>
          </div>
        </div>

        {toolkit.example && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Beispiel:</h4>
            <p className="text-gray-600">
              {toolkit.example}
            </p>
          </div>
        )}
        
        {toolkit.steps && (
          <div className="flex-grow">
            <h4 className="font-medium mb-2">Schritte:</h4>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              {toolkit.steps.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        <Button 
          onClick={() => addToolkitToProfile(toolkit)}
          className="w-full mt-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Routine hinzufügen
        </Button>
      </Card>
    );
  };

  const getActiveToolkits = () => {
    switch (activeTab) {
      case 'routines':
        return activeRoutines || [];
      case 'community':
        return []; // TODO: Implement community routines
      case 'inspiration':
        return INSPIRATION_TOOLKITS;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Habit Baukasten</h1>
          
          <div className="flex gap-4 border-b">
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === 'routines' 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => setActiveTab('routines')}
            >
              Meine Routinen
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === 'community' 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => setActiveTab('community')}
            >
              Community
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                activeTab === 'inspiration' 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => setActiveTab('inspiration')}
            >
              Inspiration
            </button>
          </div>
        </div>
        
        <div className="relative py-10">
          {getActiveToolkits().length > 0 ? (
            <Carousel
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full max-w-5xl mx-auto"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {getActiveToolkits().map((toolkit, index) => (
                  <CarouselItem key={toolkit.id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      {renderToolkit(toolkit)}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="absolute -left-4 top-1/2 -translate-y-1/2">
                <CarouselPrevious />
              </div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                <CarouselNext />
              </div>
            </Carousel>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600 mb-4">
                {activeTab === 'routines' 
                  ? 'Du hast noch keine Routinen erstellt' 
                  : 'Keine Einträge gefunden'}
              </p>
              {activeTab === 'routines' && <AddHabitDialog />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Toolbox;
