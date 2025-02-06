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
import { Brain, Target, Calendar, Plus, Users, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";

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
  const { toast } = useToast();

  // Query for active habits/routines
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

  const renderToolkits = (toolkits: any[]) => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {toolkits.map((toolkit) => {
        const Icon = toolkit.icon || Calendar;
        return (
          <Card key={toolkit.id} className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Icon className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <h3 className="font-medium">{toolkit.name || toolkit.title}</h3>
                <p className="text-sm text-gray-600">
                  {toolkit.description || toolkit.category}
                </p>
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  onClick={() => setSelectedToolkit(toolkit)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Details anzeigen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{toolkit.name || toolkit.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {toolkit.example && (
                    <div>
                      <h4 className="font-medium mb-2">Beispiel:</h4>
                      <p className="text-sm text-gray-600">
                        {toolkit.example}
                      </p>
                    </div>
                  )}
                  {toolkit.steps && (
                    <div>
                      <h4 className="font-medium mb-2">Schritte:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {toolkit.steps.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button 
                    onClick={() => addToolkitToProfile(toolkit)}
                    className="w-full"
                  >
                    Routine hinzufügen
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Habit Baukasten</h1>
        </div>
        
        <Tabs defaultValue="my-routines" className="space-y-6">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="my-routines">Meine Routinen</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
            <TabsTrigger value="inspiration">Inspiration</TabsTrigger>
          </TabsList>

          <TabsContent value="my-routines" className="space-y-6">
            {renderToolkits(activeRoutines || [])}
            <div className="mt-6">
              <AddHabitDialog />
            </div>
          </TabsContent>

          <TabsContent value="community">
            {renderToolkits(INSPIRATION_TOOLKITS.filter(t => t.id === "meditation"))}
          </TabsContent>

          <TabsContent value="inspiration">
            {renderToolkits(INSPIRATION_TOOLKITS)}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Toolbox;