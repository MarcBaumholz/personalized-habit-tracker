
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImplementationIntentions } from "./ImplementationIntentions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImplementationIntention {
  if: string;
  then: string;
  id: string;
}

export const AddHabitDialog = () => {
  const { toast } = useToast();
  const [habitData, setHabitData] = useState({
    name: "",
    category: "",
    frequency: "",
    timeOfDay: "",
    difficulty: "",
    why: "",
    identity: "",
    context: "",
    effort: "",
    smartGoal: "",
    repetition_type: "daily",
    minimal_dose: "", // Added field for minimal dose
  });
  const [intentions, setIntentions] = useState<ImplementationIntention[]>([
    { if: "", then: "", id: crypto.randomUUID() }
  ]);
  const [activeTab, setActiveTab] = useState("basic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitData.name || !habitData.category) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte fülle mindestens Name und Kategorie aus.",
        variant: "destructive",
      });
      return;
    }
    console.log("New habit data:", { ...habitData, implementation_intentions: intentions });
    toast({
      title: "Gewohnheit erstellt",
      description: "Deine neue Gewohnheit wurde erfolgreich hinzugefügt.",
    });
  };

  const handleSaveIntentions = (updatedIntentions: ImplementationIntention[]) => {
    setIntentions(updatedIntentions);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] h-[90vh]">
        <DialogHeader>
          <DialogTitle>Neue Gewohnheit erstellen</DialogTitle>
          <DialogDescription>
            Definiere deine neue Gewohnheit im Detail, um sie erfolgreich zu etablieren.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="basic">Grundlagen</TabsTrigger>
              <TabsTrigger value="advanced">Details</TabsTrigger>
              <TabsTrigger value="intentions">Wenn-Dann</TabsTrigger>
              <TabsTrigger value="minimal">Minimal Dose</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name der Gewohnheit</Label>
                    <Input
                      id="name"
                      value={habitData.name}
                      onChange={(e) => setHabitData({ ...habitData, name: e.target.value })}
                      placeholder="z.B. Deep Work"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Lebensbereich</Label>
                    <Select
                      value={habitData.category}
                      onValueChange={(value) => setHabitData({ ...habitData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wähle einen Bereich" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="career">Karriere</SelectItem>
                        <SelectItem value="health">Gesundheit</SelectItem>
                        <SelectItem value="relationships">Beziehungen</SelectItem>
                        <SelectItem value="personal">Persönliche Entwicklung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="repetition_type">Wiederholung</Label>
                    <Select
                      value={habitData.repetition_type}
                      onValueChange={(value) => setHabitData({ ...habitData, repetition_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Art der Wiederholung" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Täglich</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                        <SelectItem value="monthly">Monatlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Häufigkeit</Label>
                    <Select
                      value={habitData.frequency}
                      onValueChange={(value) => setHabitData({ ...habitData, frequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wie oft?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Täglich</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                        <SelectItem value="workdays">Werktags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="why">Warum diese Gewohnheit?</Label>
                  <Textarea
                    id="why"
                    value={habitData.why}
                    onChange={(e) => setHabitData({ ...habitData, why: e.target.value })}
                    placeholder="Was ist deine Motivation?"
                    className="h-20"
                  />
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="advanced">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smartGoal">SMART Ziel</Label>
                  <Textarea
                    id="smartGoal"
                    value={habitData.smartGoal}
                    onChange={(e) => setHabitData({ ...habitData, smartGoal: e.target.value })}
                    placeholder="Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert"
                    className="h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Schwierigkeitsgrad</Label>
                    <Select
                      value={habitData.difficulty}
                      onValueChange={(value) => setHabitData({ ...habitData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wie schwierig?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Leicht</SelectItem>
                        <SelectItem value="medium">Mittel</SelectItem>
                        <SelectItem value="hard">Schwer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="effort">Geschätzter Aufwand</Label>
                    <Select
                      value={habitData.effort}
                      onValueChange={(value) => setHabitData({ ...habitData, effort: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wie viel Zeit?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5min">5 Minuten</SelectItem>
                        <SelectItem value="15min">15 Minuten</SelectItem>
                        <SelectItem value="30min">30 Minuten</SelectItem>
                        <SelectItem value="60min">1 Stunde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="context">Kontext & Trigger</Label>
                  <Textarea
                    id="context"
                    value={habitData.context}
                    onChange={(e) => setHabitData({ ...habitData, context: e.target.value })}
                    placeholder="In welcher Situation möchtest du diese Gewohnheit ausführen?"
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identity">Identität</Label>
                  <Textarea
                    id="identity"
                    value={habitData.identity}
                    onChange={(e) => setHabitData({ ...habitData, identity: e.target.value })}
                    placeholder="Wer möchtest du durch diese Gewohnheit werden?"
                    className="h-20"
                  />
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="intentions">
              <ImplementationIntentions 
                initialIntentions={intentions}
                onSave={handleSaveIntentions}
                title="Wenn-Dann Pläne für deine Gewohnheit"
                description="Definiere konkrete Situationen und wie du in diesen auf deine Gewohnheit reagieren wirst."
              />
            </TabsContent>
            
            <TabsContent value="minimal">
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="text-lg font-medium text-green-800 mb-2">Minimale Dosis festlegen</h3>
                  <p className="text-sm text-green-700 mb-4">
                    Definiere eine "minimale Version" deiner Gewohnheit für Tage, an denen du wenig Zeit oder Energie hast.
                    Diese minimale Dosis hilft dir, deine Streak nicht zu unterbrechen.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="minimal_dose" className="text-green-700">Minimale Dosis</Label>
                      <Textarea
                        id="minimal_dose"
                        value={habitData.minimal_dose}
                        onChange={(e) => setHabitData({ ...habitData, minimal_dose: e.target.value })}
                        placeholder="z.B. Nur 5 Minuten meditieren statt 20 Minuten"
                        className="h-20"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-white p-3 rounded-lg border border-green-100">
                    <h4 className="font-medium text-green-800 mb-1">Tipp:</h4>
                    <p className="text-sm text-green-700">
                      An schwierigen Tagen kann die minimale Dosis mit dem "Stern" ⭐ markiert werden, 
                      um anzuzeigen, dass du die Gewohnheit zwar ausgeführt hast, aber in reduzierter Form.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            type="submit" 
            className="w-full mt-6" 
            onClick={handleSubmit}
          >
            Gewohnheit erstellen
          </Button>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
