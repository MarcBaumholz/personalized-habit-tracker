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
import { Brain, Target, Calendar, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";

const HABIT_TOOLKITS = [
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
    id: "meditation",
    title: "Meditation",
    description: "Innere Ruhe kultivieren",
    icon: Target,
    example: "Tägliche 10-minütige Achtsamkeitsübung",
    steps: [
      "Finde einen ruhigen Ort",
      "Starte mit geführten Meditationen",
      "Erhöhe schrittweise die Dauer",
    ],
  },
];

export const Toolbox = () => {
  const [selectedToolkit, setSelectedToolkit] = useState<any>(null);
  const { toast } = useToast();

  const addToolkitToProfile = async (toolkit: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await supabase.from("habits").insert({
        user_id: user.id,
        name: toolkit.title,
        category: "toolkit",
        context: JSON.stringify(toolkit),
      });

      toast({
        title: "Baukasten hinzugefügt",
        description: `${toolkit.title} wurde zu deinem Profil hinzugefügt.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Baukasten konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Habit Baukasten</h1>
          <AddHabitDialog />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {HABIT_TOOLKITS.map((toolkit) => {
            const Icon = toolkit.icon;
            return (
              <Card key={toolkit.id} className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{toolkit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {toolkit.description}
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
                      Anwenden
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{toolkit.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Beispiel:</h4>
                        <p className="text-sm text-muted-foreground">
                          {toolkit.example}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Schritte:</h4>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {toolkit.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => addToolkitToProfile(toolkit)}
                        className="w-full"
                      >
                        Baukasten nutzen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Toolbox;