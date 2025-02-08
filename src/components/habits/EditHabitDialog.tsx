
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Bell, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    reminderTime: habit.reminder_time || "",
    reminderType: habit.reminder_type || "default",
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
          reminder_time: habitData.reminderTime || null,
          reminder_type: habitData.reminderType,
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

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habit.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["active-routines"] });
      
      toast({
        title: "Gewohnheit gelöscht",
        description: "Die Gewohnheit wurde erfolgreich gelöscht.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Gewohnheit konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Gewohnheit bearbeiten</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reminderTime">Erinnerung</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="reminderTime"
                    type="time"
                    value={habitData.reminderTime}
                    onChange={(e) => setHabitData({ ...habitData, reminderTime: e.target.value })}
                    className="flex-1"
                  />
                  <Bell className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderType">Erinnerungstyp</Label>
                <Select
                  value={habitData.reminderType}
                  onValueChange={(value) => setHabitData({ ...habitData, reminderType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Art der Erinnerung" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Standard</SelectItem>
                    <SelectItem value="push">Push-Benachrichtigung</SelectItem>
                    <SelectItem value="email">E-Mail</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <Label htmlFor="smartGoal">SMART Ziel</Label>
              <Textarea
                id="smartGoal"
                value={habitData.smartGoal}
                onChange={(e) => setHabitData({ ...habitData, smartGoal: e.target.value })}
                placeholder="Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert"
                className="h-20"
              />
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Speichern
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
