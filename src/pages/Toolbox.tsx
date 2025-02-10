
import { Navigation } from "@/components/layout/Navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Brain, Target, Calendar, List, BookOpen, Clock, Lightbulb, Package } from "lucide-react";
import { ToolboxHeader } from "@/components/toolbox/ToolboxHeader";
import { ToolboxCarousel } from "@/components/toolbox/ToolboxCarousel";

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

  const getActiveToolkits = () => {
    switch (activeTab) {
      case 'routines':
        return activeRoutines || [];
      case 'inspiration':
        return INSPIRATION_TOOLKITS;
      case 'community':
        return []; // This could be populated with community data in the future
      default:
        return [];
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <ToolboxHeader 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
          />
          
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
        </div>
      </main>
    </div>
  );
};

export default Toolbox;
