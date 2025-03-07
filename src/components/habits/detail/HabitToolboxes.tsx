
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Package, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Toolbox {
  id: string;
  title: string;
  description: string;
  is_favorite?: boolean;
  type?: string;
  category?: string;
  steps?: string[];
  impact_area?: string[];
}

interface HabitToolboxesProps {
  toolboxes: Toolbox[];
  habitId: string;
  onToolboxUpdate: () => void;
}

export const HabitToolboxes = ({ toolboxes = [], habitId, onToolboxUpdate }: HabitToolboxesProps) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'routines' | 'inspiration'>('routines');
  const [selectedToolbox, setSelectedToolbox] = useState<Toolbox | null>(null);

  const INSPIRATION_TOOLKITS = [
    {
      id: "morning-routine",
      title: "Morgenroutine",
      description: "Optimaler Start in den Tag",
      category: "Routine",
      steps: [
        "Wähle eine feste Uhrzeit",
        "Bereite deine Umgebung vor",
        "Starte mit 5-10 Minuten",
      ],
    },
    {
      id: "deep-work",
      title: "Deep Work",
      description: "Maximale Produktivität durch fokussierte Arbeit",
      category: "Produktivität",
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
      category: "Tracking",
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
      category: "Organisation",
      steps: [
        "Kategorisiere deine Informationen",
        "Erstelle klare Strukturen",
        "Pflege regelmäßige Reviews",
      ],
    },
  ];

  const toggleFavorite = async (toolbox: Toolbox) => {
    try {
      const { error } = await supabase
        .from('habit_toolboxes')
        .update({ is_favorite: !toolbox.is_favorite })
        .eq('id', toolbox.id);

      if (error) throw error;

      toast({
        title: toolbox.is_favorite ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt",
        description: `"${toolbox.title}" wurde ${toolbox.is_favorite ? "aus deinen Favoriten entfernt" : "zu deinen Favoriten hinzugefügt"}.`,
      });

      onToolboxUpdate();
    } catch (error) {
      console.error("Error toggling favorite status:", error);
      toast({
        title: "Fehler",
        description: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  const removeToolbox = async (id: string) => {
    try {
      const { error } = await supabase
        .from('habit_toolboxes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Toolbox entfernt",
        description: "Die Toolbox wurde erfolgreich entfernt.",
      });

      onToolboxUpdate();
    } catch (error) {
      console.error("Error removing toolbox:", error);
      toast({
        title: "Fehler",
        description: "Die Toolbox konnte nicht entfernt werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  const addToolbox = async (toolbox: any) => {
    try {
      // Close the previous selection
      setSelectedToolbox(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const toolboxData = {
        user_id: user.id,
        habit_id: habitId,
        title: toolbox.title,
        description: toolbox.description,
        category: toolbox.category || "Sonstiges",
        steps: toolbox.steps || [],
        is_favorite: false,
        type: toolbox.type || "custom"
      };

      const { error } = await supabase
        .from('habit_toolboxes')
        .insert(toolboxData);

      if (error) throw error;

      toast({
        title: "Toolbox hinzugefügt",
        description: `"${toolbox.title}" wurde erfolgreich hinzugefügt.`,
      });

      setIsAddDialogOpen(false);
      onToolboxUpdate();
    } catch (error) {
      console.error("Error adding toolbox:", error);
      toast({
        title: "Fehler",
        description: "Die Toolbox konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  const ToolboxCard = ({ toolbox }: { toolbox: any }) => (
    <div className="p-4 border rounded-lg bg-white hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setSelectedToolbox(toolbox)}>
      <h3 className="font-bold text-blue-700 mb-1">{toolbox.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{toolbox.description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        <Badge variant="secondary" className="text-xs">
          {toolbox.category}
        </Badge>
      </div>
    </div>
  );

  const renderToolboxDetails = () => {
    if (!selectedToolbox) return null;

    return (
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-bold text-blue-700 mb-2">{selectedToolbox.title}</h3>
        <p className="text-gray-600 mb-4">{selectedToolbox.description}</p>
        
        {selectedToolbox.steps && selectedToolbox.steps.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Schritte:</h4>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              {selectedToolbox.steps.map((step: string, index: number) => (
                <li key={index} className="text-gray-600">{step}</li>
              ))}
            </ul>
          </div>
        )}
        
        <Button 
          onClick={() => addToolbox(selectedToolbox)} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Diese Toolbox hinzufügen
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Toolboxes</span>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Toolbox hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Toolbox hinzufügen</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)}>
                <TabsList className="bg-blue-100/50 rounded-xl p-1 mb-6">
                  <TabsTrigger
                    value="routines"
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
                  >
                    Toolboxes
                  </TabsTrigger>
                  <TabsTrigger
                    value="inspiration"
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
                  >
                    Inspiration
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="routines" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {toolboxes
                      .filter(tb => !tb.is_favorite)
                      .map((toolbox) => (
                        <ToolboxCard key={toolbox.id} toolbox={toolbox} />
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="inspiration" className="flex gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {INSPIRATION_TOOLKITS.map((toolkit) => (
                      <ToolboxCard key={toolkit.id} toolbox={toolkit} />
                    ))}
                  </div>
                  {selectedToolbox && (
                    <div className="w-2/5">
                      {renderToolboxDetails()}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {toolboxes && toolboxes.length > 0 ? (
          <div className="space-y-4">
            {toolboxes.map((toolbox) => (
              <div key={toolbox.id} className="p-4 border rounded-lg relative hover:shadow-md transition-shadow bg-white">
                <div className="absolute top-3 right-3 flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => toggleFavorite(toolbox)}
                  >
                    <Star 
                      className={`h-4 w-4 ${toolbox.is_favorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'} hover:text-yellow-500`} 
                    />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => removeToolbox(toolbox.id)}
                  >
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
                <h3 className="font-bold text-blue-700 mb-1">{toolbox.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{toolbox.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {toolbox.is_favorite && (
                    <Badge variant="favorite" className="text-xs">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500" />
                      Favorit
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {toolbox.category}
                  </Badge>
                </div>
                {toolbox.steps && toolbox.steps.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-700 mb-1">Schritte:</p>
                    <ul className="text-xs text-gray-600 list-disc ml-4 space-y-1">
                      {toolbox.steps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Keine Toolboxes hinzugefügt</p>
            <p className="text-sm">Füge Toolboxes hinzu, um deine Gewohnheit zu unterstützen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
