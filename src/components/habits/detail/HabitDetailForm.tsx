
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface HabitDetailFormProps {
  habit: any;
  id: string | undefined;
  onUpdate?: () => void;
}

export const HabitDetailForm = ({ habit, id, onUpdate }: HabitDetailFormProps) => {
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
    cue: "",
    craving: "",
    reward: "",
    lifeArea: "",
    minimal_dose: "",
  });
  const [isPaused, setIsPaused] = useState(false);
  const [pauseData, setPauseData] = useState({
    reason: "",
    duration: "1",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days
  });
  const [showPauseDialog, setShowPauseDialog] = useState(false);

  useEffect(() => {
    if (habit) {
      setHabitData({
        name: habit.name || "",
        category: habit.category || "",
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
        cue: habit.cue || "",
        craving: habit.craving || "",
        reward: habit.reward || "",
        lifeArea: habit.life_area || "",
        minimal_dose: habit.minimal_dose || "",
      });
      
      setIsPaused(habit.paused || false);
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
      if (onUpdate) {
        onUpdate();
      }
    },
  });

  const pauseHabitMutation = useMutation({
    mutationFn: async (pauseInfo: any) => {
      const { data, error } = await supabase
        .from("habits")
        .update({
          paused: true,
          pause_reason: pauseInfo.reason,
          pause_until: pauseInfo.duration === "indefinite" ? null : pauseInfo.endDate
        })
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Gewohnheit pausiert",
        description: pauseData.duration === "indefinite" 
          ? "Deine Gewohnheit wurde auf unbestimmte Zeit pausiert." 
          : `Deine Gewohnheit wurde bis zum ${new Date(pauseData.endDate).toLocaleDateString()} pausiert.`,
      });
      setIsPaused(true);
      setShowPauseDialog(false);
      if (onUpdate) {
        onUpdate();
      }
    },
  });

  const resumeHabitMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .update({
          paused: false,
          pause_reason: null,
          pause_until: null
        })
        .eq("id", id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit", id] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Gewohnheit fortgesetzt",
        description: "Deine Gewohnheit wurde erfolgreich fortgesetzt.",
      });
      setIsPaused(false);
      if (onUpdate) {
        onUpdate();
      }
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
      cue: habitData.cue,
      craving: habitData.craving,
      reward: habitData.reward,
      life_area: habitData.lifeArea,
      minimal_dose: habitData.minimal_dose,
    });
  };

  const handlePauseHabit = () => {
    if (!pauseData.reason) {
      toast({
        title: "Grund fehlt",
        description: "Bitte gib einen Grund für die Pause an.",
        variant: "destructive",
      });
      return;
    }

    pauseHabitMutation.mutate({
      reason: pauseData.reason,
      duration: pauseData.duration,
      endDate: pauseData.endDate,
    });
  };

  const handleResumeHabit = () => {
    resumeHabitMutation.mutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-white">
        <div>
          <CardTitle>Gewohnheit bearbeiten</CardTitle>
        </div>
        <div className="flex gap-2">
          {isPaused ? (
            <Button 
              variant="outline" 
              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800" 
              onClick={handleResumeHabit}
            >
              Fortsetzen
            </Button>
          ) : (
            <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800">
                  <Pause className="h-4 w-4 mr-2" />
                  Pausieren
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gewohnheit pausieren</DialogTitle>
                  <DialogDescription>
                    Gib einen Grund an, warum du diese Gewohnheit pausieren möchtest und wie lange.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="pause-reason">Grund für die Pause</Label>
                    <Textarea
                      id="pause-reason"
                      value={pauseData.reason}
                      onChange={(e) => setPauseData({ ...pauseData, reason: e.target.value })}
                      placeholder="z.B. Urlaub, Krankheit, Zeitmangel"
                      className="h-20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pause-duration">Dauer der Pause</Label>
                    <Select
                      value={pauseData.duration}
                      onValueChange={(value) => {
                        if (value === "1") {
                          setPauseData({
                            ...pauseData,
                            duration: value,
                            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          });
                        } else if (value === "2") {
                          setPauseData({
                            ...pauseData,
                            duration: value,
                            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          });
                        } else if (value === "3") {
                          setPauseData({
                            ...pauseData,
                            duration: value,
                            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                          });
                        } else {
                          setPauseData({
                            ...pauseData,
                            duration: value,
                            endDate: ""
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="pause-duration">
                        <SelectValue placeholder="Wähle eine Dauer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Woche</SelectItem>
                        <SelectItem value="2">2 Wochen</SelectItem>
                        <SelectItem value="3">1 Monat</SelectItem>
                        <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                        <SelectItem value="indefinite">Auf unbestimmte Zeit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {pauseData.duration === "custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="pause-end-date">Ende der Pause</Label>
                      <Input
                        id="pause-end-date"
                        type="date"
                        value={pauseData.endDate}
                        onChange={(e) => setPauseData({ ...pauseData, endDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button 
                    variant="default"
                    className="bg-amber-600 hover:bg-amber-700"
                    onClick={handlePauseHabit}
                  >
                    Gewohnheit pausieren
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Grundlagen</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="advanced">Fortgeschritten</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="why">Warum ist diese Gewohnheit wichtig für dich?</Label>
              <Textarea
                id="why"
                value={habitData.why}
                onChange={(e) => setHabitData({ ...habitData, why: e.target.value })}
                className="h-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimal_dose" className="text-green-700 flex items-center">
                Minimale Dosis
                <span className="ml-2 text-xs text-gray-500 font-normal">
                  (für Tage mit wenig Zeit/Energie, mit ⭐ markierbar)
                </span>
              </Label>
              <Textarea
                id="minimal_dose"
                value={habitData.minimal_dose}
                onChange={(e) => setHabitData({ ...habitData, minimal_dose: e.target.value })}
                placeholder="z.B. Nur 5 Minuten meditieren statt 20 Minuten"
                className="h-20"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
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
                <Label htmlFor="cue">Auslöser (Cue)</Label>
                <Input
                  id="cue"
                  value={habitData.cue}
                  onChange={(e) => setHabitData({ ...habitData, cue: e.target.value })}
                  placeholder="Was löst diese Gewohnheit aus?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="craving">Verlangen (Craving)</Label>
                <Input
                  id="craving"
                  value={habitData.craving}
                  onChange={(e) => setHabitData({ ...habitData, craving: e.target.value })}
                  placeholder="Welches Bedürfnis wird befriedigt?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">Belohnung</Label>
              <Input
                id="reward"
                value={habitData.reward}
                onChange={(e) => setHabitData({ ...habitData, reward: e.target.value })}
                placeholder="Wie belohnst du dich?"
              />
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
                  <SelectItem value="none">Keine Erinnerung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <Button type="button" onClick={handleSubmit} className="w-full mt-6">
          <Save className="h-4 w-4 mr-2" />
          Änderungen speichern
        </Button>
      </CardContent>
    </Card>
  );
};
