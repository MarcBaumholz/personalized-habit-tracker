
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface HabitDetailFormProps {
  habit: any;
  id: string | undefined;
}

export const HabitDetailForm = ({ habit, id }: HabitDetailFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
    reminderTime: "",
    reminderType: "default",
  });

  useEffect(() => {
    if (habit) {
      setHabitData({
        name: habit.name,
        category: habit.category,
        frequency: habit.frequency || "",
        timeOfDay: habit.time_of_day || "",
        difficulty: habit.difficulty || "",
        why: habit.why || "",
        identity: habit.identity || "",
        context: habit.context || "",
        effort: habit.effort || "",
        smartGoal: habit.smart_goal || "",
        reminderTime: habit.reminder_time || "",
        reminderType: habit.reminder_type || "default",
      });
    }
  }, [habit]);

  const updateHabitMutation = useMutation({
    mutationFn: async (updatedHabit: any) => {
      const { data, error } = await supabase
        .from("habits")
        .update(updatedHabit)
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Gewohnheit aktualisiert",
        description: "Deine Änderungen wurden erfolgreich gespeichert.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateHabitMutation.mutate({
      name: habitData.name,
      category: habitData.category,
      frequency: habitData.frequency,
      time_of_day: habitData.timeOfDay,
      difficulty: habitData.difficulty,
      why: habitData.why,
      identity: habitData.identity,
      context: habitData.context,
      effort: habitData.effort,
      smart_goal: habitData.smartGoal,
      reminder_time: habitData.reminderTime || null,
      reminder_type: habitData.reminderType,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gewohnheit bearbeiten</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name der Gewohnheit</Label>
            <Input
              id="name"
              value={habitData.name}
              onChange={(e) => setHabitData({ ...habitData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <Textarea
            value={habitData.why}
            onChange={(e) => setHabitData({ ...habitData, why: e.target.value })}
            placeholder="Warum ist diese Gewohnheit wichtig für dich?"
            className="h-20"
          />

          <Button type="submit" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Änderungen speichern
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
