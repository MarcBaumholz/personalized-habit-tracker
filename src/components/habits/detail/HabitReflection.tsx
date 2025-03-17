import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  Star, 
  BellDot, 
  MessageSquare, 
  SlidersHorizontal, 
  Smile,
  CalendarDays,
  Calendar,
  Check,
  X,
  MinusCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface HabitReflectionProps {
  habitId: string;
}

const WEEK_DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export const HabitReflection = ({ habitId }: HabitReflectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState("");
  const [completionType, setCompletionType] = useState<string | null>(null);
  const [emotionRating, setEmotionRating] = useState<string | null>(null);
  const [reflectionType, setReflectionType] = useState<"daily" | "weekly">("daily");

  const [weeklyTracking, setWeeklyTracking] = useState<Record<string, string>>({
    "Mo": "",
    "Di": "",
    "Mi": "",
    "Do": "",
    "Fr": "",
    "Sa": "",
    "So": ""
  });

  const saveCompletionMutation = useMutation({
    mutationFn: async (type: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_completions")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completion_type: type,
          reflection_type: reflectionType
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit", habitId] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast({
        title: "Habit aktualisiert",
        description: "Dein Fortschritt wurde gespeichert.",
      });
    },
  });

  const saveEmotionMutation = useMutation({
    mutationFn: async (emotion: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_emotions")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          emotion: emotion,
          note: reflection,
          reflection_type: reflectionType
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit", habitId] });
      toast({
        title: "Emotion gespeichert",
        description: "Deine Emotionen wurden erfolgreich gespeichert.",
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
          habit_id: habitId,
          user_id: user.id,
          reflection_text: reflectionText,
          reflection_type: reflectionType
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setReflection("");
      queryClient.invalidateQueries({ queryKey: ["habit", habitId] });
      queryClient.invalidateQueries({ queryKey: ["habit-reflections", habitId] });
      toast({
        title: "Reflexion gespeichert",
        description: "Deine Reflexion wurde erfolgreich gespeichert.",
      });
    },
  });

  const saveWeeklyTrackingMutation = useMutation({
    mutationFn: async (weeklyData: Record<string, string>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const trackedDays = Object.entries(weeklyData)
        .filter(([_, status]) => status !== "")
        .map(([day, status]) => {
          const statusText = status === "full" ? "✅ vollständig" : status === "minimal" ? "⚡ minimal" : "❌ nicht";
          return `${day}: ${statusText}`;
        })
        .join("\n");
      
      const reflectionText = `Wöchentliches Tracking:\n${trackedDays}${reflection ? `\n\nReflexion: ${reflection}` : ''}`;

      const { data, error } = await supabase
        .from("habit_reflections")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          reflection_text: reflectionText,
          reflection_type: "weekly"
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setReflection("");
      setWeeklyTracking({
        "Mo": "",
        "Di": "",
        "Mi": "",
        "Do": "",
        "Fr": "",
        "Sa": "",
        "So": ""
      });
      queryClient.invalidateQueries({ queryKey: ["habit", habitId] });
      queryClient.invalidateQueries({ queryKey: ["habit-reflections", habitId] });
      toast({
        title: "Wöchentliches Tracking gespeichert",
        description: "Deine wöchentliche Übersicht wurde erfolgreich gespeichert.",
      });
    },
  });

  const handleCompletion = (type: string) => {
    setCompletionType(type);
    saveCompletionMutation.mutate(type);
  };

  const handleEmotionSubmit = () => {
    if (!emotionRating) {
      toast({
        title: "Bitte wähle eine Emotion",
        description: "Wähle aus, wie du dich bei dieser Gewohnheit fühlst.",
        variant: "destructive"
      });
      return;
    }
    
    saveEmotionMutation.mutate(emotionRating);
  };

  const handleReflectionSubmit = () => {
    if (reflection.trim()) {
      saveReflectionMutation.mutate(reflection);
    }
  };

  const handleWeeklySubmit = () => {
    const hasTracking = Object.values(weeklyTracking).some(value => value !== "");
    if (!hasTracking && !reflection.trim()) {
      toast({
        title: "Keine Daten zum Speichern",
        description: "Bitte tracke mindestens einen Tag oder füge eine Reflexion hinzu.",
        variant: "destructive"
      });
      return;
    }
    
    saveWeeklyTrackingMutation.mutate(weeklyTracking);
  };

  const setDayStatus = (day: string, status: string) => {
    setWeeklyTracking(prev => ({
      ...prev,
      [day]: prev[day] === status ? "" : status
    }));
  };

  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-blue-700">
            {reflectionType === "daily" ? "Täglicher Check-in" : "Wöchentlicher Check-in"}
          </CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant={reflectionType === "daily" ? "default" : "outline"} 
              size="sm"
              onClick={() => setReflectionType("daily")}
              className="flex items-center"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Täglich
            </Button>
            <Button 
              variant={reflectionType === "weekly" ? "default" : "outline"} 
              size="sm"
              onClick={() => setReflectionType("weekly")}
              className="flex items-center"
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Wöchentlich
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {reflectionType === "daily" ? (
          <Tabs defaultValue="tracking">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="emotions">Emotionen</TabsTrigger>
              <TabsTrigger value="reflection">Reflexion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracking">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 mb-4">
                  Wie hast du deine Gewohnheit heute umgesetzt?
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant={completionType === "check" ? "default" : "outline"} 
                  className="flex flex-col items-center p-3 h-auto"
                  onClick={() => handleCompletion("check")}
                >
                  <CheckCircle className={`h-8 w-8 mb-2 ${completionType === "check" ? "text-white" : "text-green-500"}`} />
                  <span className="text-xs">Erledigt</span>
                </Button>
                
                <Button 
                  variant={completionType === "minimal" ? "default" : "outline"} 
                  className="flex flex-col items-center p-3 h-auto"
                  onClick={() => handleCompletion("minimal")}
                >
                  <MinusCircle className={`h-8 w-8 mb-2 ${completionType === "minimal" ? "text-white" : "text-amber-500"} ${completionType === "minimal" ? "" : "fill-amber-50"}`} />
                  <span className="text-xs">Minimal</span>
                </Button>
                
                <Button 
                  variant={completionType === "skip" ? "default" : "outline"} 
                  className="flex flex-col items-center p-3 h-auto"
                  onClick={() => handleCompletion("skip")}
                >
                  <X className={`h-8 w-8 mb-2 ${completionType === "skip" ? "text-white" : "text-red-500"}`} />
                  <span className="text-xs">Nicht</span>
                </Button>
              </div>
              
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 mt-2"
                  onClick={() => setCompletionType(null)}
                >
                  Zurücksetzen
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="emotions">
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-2">Wie fühlst du dich bei dieser Gewohnheit?</p>
                
                <RadioGroup 
                  value={emotionRating || ""} 
                  onValueChange={setEmotionRating}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="excited" id="excited" />
                    <Label htmlFor="excited" className="flex items-center cursor-pointer">
                      <Smile className="h-4 w-4 mr-2 text-blue-500" />
                      Begeistert
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="satisfied" id="satisfied" />
                    <Label htmlFor="satisfied" className="flex items-center cursor-pointer">
                      <Smile className="h-4 w-4 mr-2 text-green-500" />
                      Zufrieden
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="neutral" id="neutral" />
                    <Label htmlFor="neutral" className="flex items-center cursor-pointer">
                      <Smile className="h-4 w-4 mr-2 text-gray-500" />
                      Neutral
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="difficult" id="difficult" />
                    <Label htmlFor="difficult" className="flex items-center cursor-pointer">
                      <Smile className="h-4 w-4 mr-2 text-orange-500" />
                      Schwierig
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="frustrated" id="frustrated" />
                    <Label htmlFor="frustrated" className="flex items-center cursor-pointer">
                      <Smile className="h-4 w-4 mr-2 text-red-500" />
                      Frustriert
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="proud" id="proud" />
                    <Label htmlFor="proud" className="flex items-center cursor-pointer">
                      <Smile className="h-4 w-4 mr-2 text-purple-500" />
                      Stolz
                    </Label>
                  </div>
                </RadioGroup>
                
                <div className="mt-4">
                  <Textarea 
                    placeholder="Notizen zu deinen Emotionen (optional)"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    className="h-20 mb-3"
                  />
                  <Button onClick={handleEmotionSubmit} className="w-full">
                    <Smile className="h-4 w-4 mr-2" />
                    Emotion speichern
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reflection">
              <div className="space-y-4">
                <Label htmlFor="reflection" className="mb-2 block">Reflexion</Label>
                <Textarea 
                  id="reflection"
                  placeholder="Wie ist es dir heute mit deiner Gewohnheit ergangen? Was hast du gelernt?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="h-32 mb-3"
                />
                <Button onClick={handleReflectionSubmit} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Reflexion speichern
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-3">Wochentracking</h3>
              
              <div className="mb-3 text-xs text-center text-gray-500">
                <div className="flex justify-center space-x-4">
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                    <span>Vollständig</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1"></span>
                    <span>Minimal</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                    <span>Nicht</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {WEEK_DAYS.map(day => (
                  <div key={day} className="text-center">
                    <div className="font-medium mb-1">{day}</div>
                    <div className="space-y-1 flex flex-col items-center">
                      <button 
                        onClick={() => setDayStatus(day, "full")}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          weeklyTracking[day] === "full" 
                            ? "bg-green-500 text-white" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setDayStatus(day, "minimal")}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          weeklyTracking[day] === "minimal" 
                            ? "bg-amber-500 text-white" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        <MinusCircle className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => setDayStatus(day, "none")}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          weeklyTracking[day] === "none" 
                            ? "bg-red-500 text-white" 
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label htmlFor="weekly-reflection" className="mb-2 block">Wöchentliche Reflexion</Label>
              <Textarea 
                id="weekly-reflection"
                placeholder="Welche Hürden und Schwierigkeiten sind diese Woche aufgetreten? Was würdest du nächste Woche anders machen?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="h-32 mb-3"
              />
              <Button onClick={handleWeeklySubmit} className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Wöchentliche Reflexion speichern
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

