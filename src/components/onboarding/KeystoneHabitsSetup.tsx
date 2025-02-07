
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

interface KeystoneHabit {
  name: string;
  description: string;
  lifeArea: string;
  guideline: string;
}

export const KeystoneHabitsSetup = ({ onComplete }: { onComplete: () => void }) => {
  const [habits, setHabits] = useState<KeystoneHabit[]>([
    { name: "", description: "", lifeArea: "", guideline: "" },
    { name: "", description: "", lifeArea: "", guideline: "" },
  ]);
  const { toast } = useToast();

  const updateHabit = (index: number, field: keyof KeystoneHabit, value: string) => {
    const newHabits = [...habits];
    newHabits[index] = { ...newHabits[index], [field]: value };
    setHabits(newHabits);
  };

  const handleSubmit = async () => {
    if (habits.some(h => !h.name || !h.description)) {
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

      const { error } = await supabase.from("keystone_habits").insert(
        habits.map(habit => ({
          user_id: user.id,
          habit_name: habit.name,
          life_area: habit.lifeArea,
          description: habit.description,
          guideline: habit.guideline,
        }))
      );

      if (error) throw error;

      toast({
        title: "Gespeichert",
        description: "Deine Keystone Habits wurden erfolgreich gespeichert",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Habits konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6 bg-white/80 backdrop-blur-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-purple-800">Deine Keystone Habits</h2>
        <p className="text-purple-600">
          Definiere zwei Schlüsselgewohnheiten, die den größten positiven Einfluss auf dein Leben haben werden
        </p>
      </div>

      {habits.map((habit, index) => (
        <div key={index} className="space-y-4 p-4 border rounded-lg bg-purple-50">
          <h3 className="font-semibold text-purple-800">Keystone Habit {index + 1}</h3>
          
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
            <Input
              value={habit.lifeArea}
              onChange={(e) => updateHabit(index, "lifeArea", e.target.value)}
              placeholder="z.B. Gesundheit"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Beschreibung & Ziel</Label>
            <Textarea
              value={habit.description}
              onChange={(e) => updateHabit(index, "description", e.target.value)}
              placeholder="Beschreibe, warum diese Gewohnheit wichtig für dich ist"
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
        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
      >
        Keystone Habits speichern
      </Button>
    </Card>
  );
};
