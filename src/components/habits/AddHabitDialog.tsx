import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  });

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
    console.log("New habit data:", habitData);
    toast({
      title: "Gewohnheit erstellt",
      description: "Deine neue Gewohnheit wurde erfolgreich hinzugefügt.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Neue Gewohnheit hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neue Gewohnheit erstellen</DialogTitle>
          <DialogDescription>
            Definiere deine neue Gewohnheit im Detail, um sie erfolgreich zu etablieren.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="timeOfDay">Tageszeit</Label>
              <Select
                value={habitData.timeOfDay}
                onValueChange={(value) => setHabitData({ ...habitData, timeOfDay: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wann?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morgens</SelectItem>
                  <SelectItem value="afternoon">Mittags</SelectItem>
                  <SelectItem value="evening">Abends</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
            <Label htmlFor="why">Warum diese Gewohnheit?</Label>
            <Textarea
              id="why"
              value={habitData.why}
              onChange={(e) => setHabitData({ ...habitData, why: e.target.value })}
              placeholder="Was ist deine Motivation?"
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

          <Button type="submit" className="w-full">Gewohnheit erstellen</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};