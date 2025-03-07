
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Calendar, 
  CheckCircle,
  Star,
  BellDot
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ToolkitCardActions } from "@/components/toolbox/ToolkitCardActions";

const HabitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [reflection, setReflection] = useState("");
  
  const { data: habit, isLoading } = useQuery({
    queryKey: ["habit", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: toolboxes } = useQuery({
    queryKey: ["habit-toolboxes", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Placeholder - in a real app, fetch toolboxes related to this habit
      return [
        { id: "1", title: "Habit-Stacking", description: "Verbinde neue Gewohnheiten mit bereits etablierten" },
        { id: "2", title: "Implementation Intentions", description: "Wenn-Dann Pläne für deine Gewohnheit" }
      ];
    },
  });

  const { data: schedules } = useQuery({
    queryKey: ["habit-schedules", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("habit_schedules")
        .select("*")
        .eq("habit_id", id);

      if (error) throw error;
      return data || [];
    },
  });

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

  const saveReflectionMutation = useMutation({
    mutationFn: async (reflectionText: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_reflections")
        .insert({
          habit_id: id,
          user_id: user.id,
          reflection_text: reflectionText
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setReflection("");
      toast({
        title: "Reflexion gespeichert",
        description: "Deine Reflexion wurde erfolgreich gespeichert.",
      });
    },
  });

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

  const handleReflectionSubmit = () => {
    if (reflection.trim()) {
      saveReflectionMutation.mutate(reflection);
    }
  };

  const calculateProgress = (habit: any) => {
    const completions = habit?.habit_completions?.length || 0;
    return Math.round((completions / 66) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="container max-w-7xl mx-auto py-6 px-4">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">Gewohnheit nicht gefunden</h2>
            <p className="text-gray-600">Die angeforderte Gewohnheit existiert nicht oder du hast keinen Zugriff.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container max-w-7xl mx-auto py-6 px-4">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{habit.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Progress value={calculateProgress(habit)} className="h-2 flex-1" />
            <span className="text-sm font-medium">{calculateProgress(habit)}%</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Habit Details and Schedules */}
          <div className="space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Planungen</span>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Planen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedules && schedules.length > 0 ? (
                  <div className="space-y-3">
                    {schedules.map((schedule: any) => (
                      <div key={schedule.id} className="p-3 bg-blue-50 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{new Date(schedule.scheduled_date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{schedule.scheduled_time || "Keine Zeit festgelegt"}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Keine Planungen vorhanden</p>
                    <p className="text-sm">Plane deine Gewohnheit im Kalender</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Übersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-md">
                    <h3 className="font-medium mb-1">Identität</h3>
                    <p className="text-sm text-gray-700">{habit.identity || "Keine Angabe"}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-md">
                    <h3 className="font-medium mb-1">Kontext & Trigger</h3>
                    <p className="text-sm text-gray-700">{habit.context || "Keine Angabe"}</p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-md">
                    <h3 className="font-medium mb-1">SMART Ziel</h3>
                    <p className="text-sm text-gray-700">{habit.smart_goal || "Keine Angabe"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Toolboxes and Reflections */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Toolboxes</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Toolbox hinzufügen
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {toolboxes && toolboxes.length > 0 ? (
                  <div className="space-y-4">
                    {toolboxes.map((toolbox: any) => (
                      <div key={toolbox.id} className="p-4 border rounded-lg relative hover:shadow-md transition-shadow">
                        <div className="absolute top-3 right-3">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                          </Button>
                        </div>
                        <h3 className="font-bold text-blue-700 mb-1">{toolbox.title}</h3>
                        <p className="text-sm text-gray-600">{toolbox.description}</p>
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

            <Card>
              <CardHeader>
                <CardTitle>Täglicher Check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-around mb-4">
                  <Button variant="outline" className="flex flex-col items-center p-3">
                    <CheckCircle className="h-6 w-6 mb-1 text-green-500" />
                    <span className="text-xs">Erledigt</span>
                  </Button>
                  
                  <Button variant="outline" className="flex flex-col items-center p-3">
                    <Star className="h-6 w-6 mb-1 text-yellow-500" />
                    <span className="text-xs">Besonders gut</span>
                  </Button>
                  
                  <Button variant="outline" className="flex flex-col items-center p-3">
                    <BellDot className="h-6 w-6 mb-1 text-blue-500" />
                    <span className="text-xs">Erinnerung</span>
                  </Button>
                </div>
                
                <div className="mt-6">
                  <Label htmlFor="reflection" className="mb-2 block">Reflexion</Label>
                  <Textarea 
                    id="reflection"
                    placeholder="Wie lief es heute mit deiner Gewohnheit?"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="h-24 mb-3"
                  />
                  <Button onClick={handleReflectionSubmit} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reflexion speichern
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vergangene Reflexionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Heute</span>
                      <span className="text-xs text-gray-500">14:30</span>
                    </div>
                    <p className="text-sm text-gray-700">Heute ist es mir leichter gefallen als gestern. Ich konnte die Gewohnheit direkt nach dem Aufstehen umsetzen.</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Gestern</span>
                      <span className="text-xs text-gray-500">19:15</span>
                    </div>
                    <p className="text-sm text-gray-700">Ich hatte heute Schwierigkeiten, die Gewohnheit in meinen Tagesablauf zu integrieren. Morgen werde ich es direkt nach dem Frühstück versuchen.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabitDetail;
