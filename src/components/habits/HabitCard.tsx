
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { HabitProgress } from "./habit-card/HabitProgress";
import { HabitCheckbox } from "./habit-card/HabitCheckbox";
import { HabitHeader } from "./habit-card/HabitHeader";
import { HabitControls } from "./habit-card/HabitControls";

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
  const [showHabitLoop, setShowHabitLoop] = useState(false);
  const [elasticLevel, setElasticLevel] = useState(habit.elastic_level || "medium");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const totalDays = 66;
  const completedDays = habit.habit_completions?.length || 0;
  const remainingDays = totalDays - completedDays;
  
  const lastReflection = habit.habit_reflections?.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  
  const needsReflection = lastReflection ? 
    (new Date().getTime() - new Date(lastReflection.created_at).getTime()) / (1000 * 60 * 60 * 24) >= 7 
    : false;

  const deleteHabit = async () => {
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
          <HabitCheckbox
            isCompleted={isCompletedToday(habit)}
            onComplete={() => {
              if (!isCompletedToday(habit)) {
                onComplete(habit);
              }
            }}
          />
          <HabitHeader name={habit.name} completedDays={completedDays} />
        </div>
        
        <HabitControls
          habit={habit}
          elasticLevel={elasticLevel}
          onUpdateElasticLevel={updateElasticLevel}
          onShowEmotionTracker={setShowEmotionTracker}
          showEmotionTracker={showEmotionTracker}
          onShowHabitLoop={setShowHabitLoop}
          showHabitLoop={showHabitLoop}
          onReflect={() => onReflect(habit)}
          needsReflection={needsReflection}
          lastReflection={lastReflection}
          onDelete={deleteHabit}
        />
      </div>
      
      <HabitProgress
        completedDays={completedDays}
        totalDays={totalDays}
        remainingDays={remainingDays}
      />
      
      {habit.why_description && (
        <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
          <strong>Warum?</strong> {habit.why_description}
        </div>
      )}
    </div>
  );
};
