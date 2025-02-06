import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const EditHabitDialog = ({ habit }: { habit: any }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [habitData, setHabitData] = useState({
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
    whyDescription: habit.why_description || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("habits")
        .update({
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
          why_description: habitData.whyDescription,
        })
        .eq("id", habit.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["active-routines"] });
      
      toast({
        title: "Gewohnheit aktualisiert",
        description: "Deine Änderungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit2 className="h-4 w-4 mr-2" />
          Bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gewohnheit bearbeiten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name der Gewohnheit</Label>
              <Input
                id="name"
                value={habitData.name}
                onChange={(e) => setHabitData({ ...habitData, name: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="why">Warum diese Gewohnheit?</Label>
            <Textarea
              id="why"
              value={habitData.whyDescription}
              onChange={(e) => setHabitData({ ...habitData, whyDescription: e.target.value })}
              placeholder="Was ist deine Motivation?"
              className="h-20"
            />
          </div>

          <Button type="submit" className="w-full">Änderungen speichern</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};