import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, Star, BellDot, MessageSquare, SlidersHorizontal, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface HabitReflectionProps {
  habitId: string;
}

export const HabitReflection = ({ habitId }: HabitReflectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reflection, setReflection] = useState("");
  const [completionType, setCompletionType] = useState<string | null>(null);
  const [emotionRating, setEmotionRating] = useState<string | null>(null);

  const saveCompletionMutation = useMutation({
    mutationFn: async (type: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_completions")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          completion_type: type
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
          note: reflection
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
          reflection_text: reflectionText
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

  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="text-blue-700">Täglicher Check-in</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="tracking">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="emotions">Emotionen</TabsTrigger>
            <TabsTrigger value="reflection">Reflexion</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tracking">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 mb-4">Wie hast du deine Gewohnheit heute umgesetzt?</p>
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
                variant={completionType === "star" ? "default" : "outline"} 
                className="flex flex-col items-center p-3 h-auto"
                onClick={() => handleCompletion("star")}
              >
                <Star className={`h-8 w-8 mb-2 ${completionType === "star" ? "text-white" : "text-yellow-500"}`} />
                <span className="text-xs">Besonders gut</span>
              </Button>
              
              <Button 
                variant={completionType === "skip" ? "default" : "outline"} 
                className="flex flex-col items-center p-3 h-auto"
                onClick={() => handleCompletion("skip")}
              >
                <SlidersHorizontal className={`h-8 w-8 mb-2 ${completionType === "skip" ? "text-white" : "text-blue-500"}`} />
                <span className="text-xs">Angepasst</span>
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
      </CardContent>
    </Card>
  );
};
