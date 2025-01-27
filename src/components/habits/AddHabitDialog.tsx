import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useState } from "react";

export const AddHabitDialog = () => {
  const [habitData, setHabitData] = useState({
    name: "",
    category: "",
    frequency: "",
    timeOfDay: "",
    difficulty: "",
    why: "",
    identity: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New habit data:", habitData);
    // Hier würde später die Logik zum Speichern der neuen Gewohnheit implementiert
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Neue Gewohnheit hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neue Gewohnheit erstellen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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