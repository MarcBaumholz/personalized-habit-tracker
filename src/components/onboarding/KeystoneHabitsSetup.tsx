
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KeystoneHabit {
  name: string;
  why_description: string;
  lifeArea: string;
  guideline: string;
  frequency: string;
  timeOfDay: string;
  difficulty: string;
  why: string;
}

export const KeystoneHabitsSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [habits, setHabits] = useState<KeystoneHabit[]>([
    { 
      name: "", 
      why_description: "", 
      lifeArea: "", 
      guideline: "",
      frequency: "daily",
      timeOfDay: "morning",
      difficulty: "medium",
      why: ""
    },
    { 
      name: "", 
      why_description: "", 
      lifeArea: "", 
      guideline: "",
      frequency: "daily",
      timeOfDay: "morning",
      difficulty: "medium",
      why: ""
    },
  ]);
  const [showWiseImage, setShowWiseImage] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateHabit = (index: number, field: keyof KeystoneHabit, value: string) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], [field]: value };
    setHabits(newHabits);
  };

  const handleSubmit = async () => {
    if (habits.some(h => !h.name || !h.why_description)) {
      toast({
        title: "Unvollständige Eingabe",
        description: "Bitte fülle alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      for (const habit of habits) {
        // Create the normal habit first
        const { data: habitData, error: habitError } = await supabase
          .from("habits")
          .insert({
            user_id: user.id,
            name: habit.name,
            category: habit.lifeArea,
            frequency: habit.frequency,
            time_of_day: habit.timeOfDay,
            difficulty: habit.difficulty,
            why_description: habit.why_description,
            why: habit.why,
            is_keystone: true,
            phase: "implementation",
          })
          .select()
          .single();

        if (habitError) throw habitError;

        // Then create the keystone habit entry
        const { error: keystoneError } = await supabase
          .from("keystone_habits")
          .insert({
            user_id: user.id,
            habit_name: habit.name,
            life_area: habit.lifeArea,
            description: habit.why_description,
            guideline: habit.guideline,
            habit_id: habitData.id,
          });

        if (keystoneError) throw keystoneError;
      }

      toast({
        title: "Gespeichert",
        description: "Deine Keystone Habits wurden erfolgreich angelegt",
      });
      
      setShowWiseImage(true);
      setTimeout(() => {
        onComplete();
        navigate("/");
      }, 3000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Habits konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  if (showWiseImage) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <img
          src="/photo-1485827404703-89b55fcc595e"
          alt="Wise completion image"
          className="mx-auto rounded-lg shadow-xl"
        />
        <h2 className="text-2xl font-bold text-blue-800">
          Glückwunsch! Du hast den Onboarding-Prozess abgeschlossen.
        </h2>
        <p className="text-blue-600">
          Du wirst in wenigen Sekunden zu deiner personalisierten Startseite weitergeleitet...
        </p>
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6 bg-white/80 backdrop-blur-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-blue-800">Deine Keystone Habits</h2>
        <p className="text-blue-600">
          Definiere zwei Schlüsselgewohnheiten, die den größten positiven Einfluss auf dein Leben haben werden
        </p>
      </div>

      {habits.map((habit, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg bg-blue-50">
          <h3 className="font-semibold text-blue-800">Keystone Habit {index + 1}</h3>
          
          <div className="space-y-2">
            <Label>Name der Gewohnheit</Label>
            <Input
              value={habit.name}
              onChange={(e) => updateHabit(index, "name", e.target.value)}
              placeholder="z.B. Tägliche Meditation"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Lebensbereich</Label>
            <Select
              value={habit.lifeArea}
              onValueChange={(value) => updateHabit(index, "lifeArea", value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Wähle einen Bereich" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="health">Gesundheit</SelectItem>
                <SelectItem value="career">Karriere</SelectItem>
                <SelectItem value="relationships">Beziehungen</SelectItem>
                <SelectItem value="personal">Persönliche Entwicklung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Häufigkeit</Label>
            <Select
              value={habit.frequency}
              onValueChange={(value) => updateHabit(index, "frequency", value)}
            >
              <SelectTrigger className="bg-white">
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
            <Label>Tageszeit</Label>
            <Select
              value={habit.timeOfDay}
              onValueChange={(value) => updateHabit(index, "timeOfDay", value)}
            >
              <SelectTrigger className="bg-white">
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
            <Label>Schwierigkeitsgrad</Label>
            <Select
              value={habit.difficulty}
              onValueChange={(value) => updateHabit(index, "difficulty", value)}
            >
              <SelectTrigger className="bg-white">
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
            <Label>Beschreibung & Ziel</Label>
            <Textarea
              value={habit.why_description}
              onChange={(e) => updateHabit(index, "why_description", e.target.value)}
              placeholder="Beschreibe, warum diese Gewohnheit wichtig für dich ist"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Warum diese Gewohnheit?</Label>
            <Textarea
              value={habit.why}
              onChange={(e) => updateHabit(index, "why", e.target.value)}
              placeholder="Was ist deine Motivation?"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Umsetzungsleitfaden</Label>
            <Textarea
              value={habit.guideline}
              onChange={(e) => updateHabit(index, "guideline", e.target.value)}
              placeholder="Wie willst du diese Gewohnheit konkret umsetzen?"
              className="bg-white"
            />
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Keystone Habits speichern
      </Button>
    </Card>
  );
};
