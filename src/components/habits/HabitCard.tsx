import { Button } from "@/components/ui/button";
import { Flame, Circle, Check, Smile, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmotionTracker } from "./EmotionTracker";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HabitCardProps {
  habit: any;
  onComplete: (habit: any) => void;
  onReflect: (habit: any) => void;
  isCompletedToday: (habit: any) => boolean;
  calculateProgress: (habit: any) => number;
}

export const HabitCard = ({
  habit,
  onComplete,
  onReflect,
  isCompletedToday,
  calculateProgress,
}: HabitCardProps) => {
  const [showEmotionTracker, setShowEmotionTracker] = useState(false);
  const [elasticLevel, setElasticLevel] = useState(habit.elastic_level || "medium");
  const { toast } = useToast();
  
  const progress = calculateProgress(habit);
  const totalDays = 66;
  const completedDays = habit.habit_completions?.length || 0;
  const remainingDays = totalDays - completedDays;
  
  const lastReflection = habit.habit_reflections?.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  
  const needsReflection = lastReflection ? 
    (new Date().getTime() - new Date(lastReflection.created_at).getTime()) / (1000 * 60 * 60 * 24) >= 7 
    : false;

  const updateElasticLevel = async (newLevel: string) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({ elastic_level: newLevel })
        .eq("id", habit.id);

      if (error) throw error;

      setElasticLevel(newLevel);
      toast({
        title: "Level angepasst",
        description: `Schwierigkeitsgrad wurde auf ${newLevel} gesetzt.`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Schwierigkeitsgrad konnte nicht angepasst werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isCompletedToday(habit)) {
                onComplete(habit);
              }
            }}
            className="relative w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-colors"
          >
            {isCompletedToday(habit) ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </button>
          <div>
            <h3 className="font-medium text-gray-900">{habit.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>{completedDays}</span>
              {[...Array(4)].map((_, i) => (
                <Flame key={i} className="w-4 h-4 text-orange-500" />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateElasticLevel(elasticLevel === "easy" ? "medium" : "easy")}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <span className="text-xs text-gray-500 capitalize">{elasticLevel}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateElasticLevel(elasticLevel === "hard" ? "medium" : "hard")}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={showEmotionTracker} onOpenChange={setShowEmotionTracker}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Smile className="h-4 w-4 mr-2" />
                Gefühl
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Wie fühlst du dich?</DialogTitle>
              </DialogHeader>
              <EmotionTracker
                habitId={habit.id}
                onClose={() => setShowEmotionTracker(false)}
              />
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            variant={needsReflection ? "destructive" : "outline"}
            onClick={() => onReflect(habit)}
            className={cn(
              "transition-colors",
              lastReflection && !needsReflection && "border-green-500 text-green-600"
            )}
          >
            Reflektieren
          </Button>
        </div>
      </div>
      
      <div className="flex gap-1">
        {[...Array(totalDays)].map((_, index) => (
          <div
            key={index}
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              index < completedDays ? "bg-green-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>
      
      <div className="text-sm text-gray-600">
        Noch {remainingDays} Tage bis zum Automatismus
      </div>
      {habit.why_description && (
        <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
          <strong>Warum?</strong> {habit.why_description}
        </div>
      )}
    </div>
  );
};