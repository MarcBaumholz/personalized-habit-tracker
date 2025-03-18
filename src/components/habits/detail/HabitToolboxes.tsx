
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Package, Star, ArrowLeft, ArrowRight, Check, InfinityIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
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
  cue?: string;
  craving?: string;
  routine?: string;
  reward?: string;
  minimal_dose?: string;
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
  const [setupStep, setSetupStep] = useState(0);
  const [toolboxData, setToolboxData] = useState<any>({
    title: "",
    description: "",
    category: "",
    cue: "",
    craving: "",
    routine: "",
    reward: "",
    minimal_dose: "",
    steps: [""]
  });
  const [isLoadingToolboxes, setIsLoadingToolboxes] = useState(false);
  const [communityToolboxes, setCommunityToolboxes] = useState<Toolbox[]>([]);

  useEffect(() => {
    if (selectedToolbox) {
      setToolboxData({
        title: selectedToolbox.title || "",
        description: selectedToolbox.description || "",
        category: selectedToolbox.category || "General",
        cue: selectedToolbox.cue || "",
        craving: selectedToolbox.craving || "",
        routine: selectedToolbox.routine || "",
        reward: selectedToolbox.reward || "",
        minimal_dose: selectedToolbox.minimal_dose || "",
        steps: selectedToolbox.steps || [""]
      });
    }
  }, [selectedToolbox]);

  useEffect(() => {
    const loadCommunityToolboxes = async () => {
      setIsLoadingToolboxes(true);
      try {
        // In a real app, this would fetch from a community toolboxes table
        // For now, we'll just use some sample data
        setTimeout(() => {
          setCommunityToolboxes(INSPIRATION_TOOLKITS);
          setIsLoadingToolboxes(false);
        }, 500);
      } catch (error) {
        console.error("Error loading community toolboxes:", error);
        setIsLoadingToolboxes(false);
      }
    };

    if (isAddDialogOpen && activeTab === 'inspiration') {
      loadCommunityToolboxes();
    }
  }, [isAddDialogOpen, activeTab]);

  const INSPIRATION_TOOLKITS = [
    {
      id: "hooked-model",
      title: "Hooked-Modell",
      description: "Analysiere deine Gewohnheit mit dem Hooked-Modell von Nir Eyal",
      category: "Analyse",
      steps: [
        "Identifiziere externe und interne Auslöser",
        "Definiere die konkrete Handlung",
        "Bestimme die variable Belohnung",
        "Plane die Investition",
      ],
      cue: "Wann wird die Gewohnheit ausgelöst?",
      craving: "Welches Verlangen wird angesprochen?",
      routine: "Was ist die eigentliche Handlung?",
      reward: "Wie belohnst du dich?",
      minimal_dose: "Kleinste sinnvolle Einheit",
    },
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
      category: "Produktivität",
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

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...toolboxData.steps];
    newSteps[index] = value;
    setToolboxData({ ...toolboxData, steps: newSteps });
  };

  const addStep = () => {
    setToolboxData({ ...toolboxData, steps: [...toolboxData.steps, ""] });
  };

  const removeStep = (index: number) => {
    const newSteps = [...toolboxData.steps];
    newSteps.splice(index, 1);
    setToolboxData({ ...toolboxData, steps: newSteps });
  };

  const addToolbox = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Filter out empty steps
      const filteredSteps = toolboxData.steps.filter((step: string) => step.trim() !== "");

      const toolboxToAdd = {
        user_id: user.id,
        habit_id: habitId,
        title: toolboxData.title || selectedToolbox?.title,
        description: toolboxData.description || selectedToolbox?.description,
        category: toolboxData.category || selectedToolbox?.category || "General",
        steps: filteredSteps.length > 0 ? filteredSteps : [],
        is_favorite: false,
        type: selectedToolbox?.type || "custom",
        cue: toolboxData.cue,
        craving: toolboxData.craving,
        routine: toolboxData.routine,
        reward: toolboxData.reward,
        minimal_dose: toolboxData.minimal_dose
      };

      const { error } = await supabase
        .from('habit_toolboxes')
        .insert(toolboxToAdd);

      if (error) throw error;

      toast({
        title: "Toolbox hinzugefügt",
        description: `"${toolboxData.title || selectedToolbox?.title}" wurde erfolgreich hinzugefügt.`,
      });

      // Reset the dialog state
      setIsAddDialogOpen(false);
      setSelectedToolbox(null);
      setSetupStep(0);
      setToolboxData({
        title: "",
        description: "",
        category: "",
        cue: "",
        craving: "",
        routine: "",
        reward: "",
        minimal_dose: "",
        steps: [""]
      });

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

  const handleToolboxSelection = (toolbox: Toolbox) => {
    setSelectedToolbox(toolbox);
    setSetupStep(1); // Move to step 1 (basic information)
  };

  const renderSetupSteps = () => {
    switch (setupStep) {
      case 0: // Selection screen
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(activeTab === 'routines' ? toolboxes : communityToolboxes)
              .filter(tb => activeTab === 'inspiration' || !tb.is_favorite)
              .map((toolbox) => (
                <ToolboxCard 
                  key={toolbox.id} 
                  toolbox={toolbox} 
                  onSelect={handleToolboxSelection} 
                />
              ))}
          </div>
        );
      
      case 1: // Basic Information
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Grundinformationen</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={toolboxData.title || selectedToolbox?.title || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, title: e.target.value })}
                  placeholder="Titel der Toolbox"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={toolboxData.description || selectedToolbox?.description || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, description: e.target.value })}
                  placeholder="Beschreibung der Toolbox"
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="category">Kategorie</Label>
                <Input
                  id="category"
                  value={toolboxData.category || selectedToolbox?.category || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, category: e.target.value })}
                  placeholder="z.B. Produktivität, Achtsamkeit, etc."
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setSetupStep(0)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={() => setSetupStep(2)}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 2: // Habit Loop
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Habit Loop definieren</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="cue">Auslöser (Cue)</Label>
                <Input
                  id="cue"
                  value={toolboxData.cue || selectedToolbox?.cue || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, cue: e.target.value })}
                  placeholder="Was löst die Gewohnheit aus?"
                />
              </div>
              <div>
                <Label htmlFor="craving">Verlangen (Craving)</Label>
                <Input
                  id="craving"
                  value={toolboxData.craving || selectedToolbox?.craving || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, craving: e.target.value })}
                  placeholder="Welches Bedürfnis wird angesprochen?"
                />
              </div>
              <div>
                <Label htmlFor="routine">Routine</Label>
                <Input
                  id="routine"
                  value={toolboxData.routine || selectedToolbox?.routine || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, routine: e.target.value })}
                  placeholder="Was ist die eigentliche Handlung?"
                />
              </div>
              <div>
                <Label htmlFor="reward">Belohnung</Label>
                <Input
                  id="reward"
                  value={toolboxData.reward || selectedToolbox?.reward || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, reward: e.target.value })}
                  placeholder="Wie belohnst du dich?"
                />
              </div>
              <div>
                <Label htmlFor="minimal_dose">Minimale Dosis</Label>
                <Input
                  id="minimal_dose"
                  value={toolboxData.minimal_dose || selectedToolbox?.minimal_dose || ""}
                  onChange={(e) => setToolboxData({ ...toolboxData, minimal_dose: e.target.value })}
                  placeholder="Kleinste sinnvolle Einheit"
                />
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setSetupStep(1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={() => setSetupStep(3)}>
                Weiter <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      
      case 3: // Implementation Steps
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Implementierungsschritte</h3>
            <div className="space-y-3">
              {toolboxData.steps.map((step: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                    placeholder={`Schritt ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(index)}
                    disabled={toolboxData.steps.length <= 1}
                    className="h-10 w-10 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addStep}
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Schritt hinzufügen
              </Button>
            </div>
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setSetupStep(2)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
              </Button>
              <Button onClick={addToolbox}>
                <Check className="mr-2 h-4 w-4" /> Toolbox hinzufügen
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const ToolboxCard = ({ toolbox, onSelect }: { toolbox: any; onSelect: (toolbox: any) => void }) => (
    <div 
      className="p-4 border rounded-lg bg-white hover:bg-blue-50 transition-colors cursor-pointer" 
      onClick={() => onSelect(toolbox)}
    >
      <h3 className="font-bold text-blue-700 mb-1">{toolbox.title}</h3>
      <p className="text-sm text-gray-600 mb-2">{toolbox.description}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        <Badge variant="secondary" className="text-xs">
          {toolbox.category || 'Allgemein'}
        </Badge>
        {toolbox.type === 'community' && (
          <Badge variant="outline" className="text-xs">
            Community
          </Badge>
        )}
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
          onClick={() => setSetupStep(1)} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Diese Toolbox anpassen
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
                <DialogDescription>
                  Wähle eine Toolbox aus oder erstelle eine eigene.
                </DialogDescription>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={(value: any) => {
                setActiveTab(value);
                setSelectedToolbox(null);
                setSetupStep(0);
              }}>
                <TabsList className="bg-blue-100/50 rounded-xl p-1 mb-6">
                  <TabsTrigger
                    value="routines"
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
                  >
                    Meine Toolboxes
                  </TabsTrigger>
                  <TabsTrigger
                    value="inspiration"
                    className="rounded-lg px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow"
                  >
                    Inspiration
                  </TabsTrigger>
                </TabsList>

                <div className="min-h-[400px]">
                  {selectedToolbox && setupStep === 0 ? (
                    <div className="flex gap-4">
                      <div className="grid grid-cols-1 gap-4 flex-1">
                        {renderSetupSteps()}
                      </div>
                      <div className="w-2/5">
                        {renderToolboxDetails()}
                      </div>
                    </div>
                  ) : (
                    renderSetupSteps()
                  )}

                  {isLoadingToolboxes && (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
                    </div>
                  )}
                </div>
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

                {(toolbox.cue || toolbox.craving || toolbox.routine || toolbox.reward) && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-md">
                    <p className="text-xs font-medium text-gray-700 mb-1">Habit Loop:</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {toolbox.cue && (
                        <div>
                          <span className="font-medium">Auslöser:</span> {toolbox.cue}
                        </div>
                      )}
                      {toolbox.craving && (
                        <div>
                          <span className="font-medium">Verlangen:</span> {toolbox.craving}
                        </div>
                      )}
                      {toolbox.routine && (
                        <div>
                          <span className="font-medium">Routine:</span> {toolbox.routine}
                        </div>
                      )}
                      {toolbox.reward && (
                        <div>
                          <span className="font-medium">Belohnung:</span> {toolbox.reward}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {toolbox.minimal_dose && (
                  <div className="mt-2 text-xs">
                    <span className="font-medium">Minimale Dosis:</span> {toolbox.minimal_dose}
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
