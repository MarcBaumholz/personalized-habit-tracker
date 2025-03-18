
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, BellDot, Star, Flame } from "lucide-react";
import { differenceInDays } from "date-fns";
import { EditHabitDialog } from "./EditHabitDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface HabitRowProps {
  habit: any;
  onReflectionClick: (habit: any) => void;
  onCompletionClick: (habit: any) => void;
  onSatisfactionClick: (habit: any) => void;
  isCompletedToday: (habit: any) => boolean;
}

export const HabitRow = ({
  habit,
  onReflectionClick,
  onCompletionClick,
  onSatisfactionClick,
  isCompletedToday,
}: HabitRowProps) => {
  const isMobile = useIsMobile();

  const calculateProgress = (habit: any) => {
    const completions = habit.habit_completions?.length || 0;
    return Math.round((completions / 66) * 100);
  };

  const getStreakCount = (habit: any) => {
    return habit.habit_completions?.length || 0;
  };

  const getRemainingDays = (habit: any) => {
    const completions = habit.habit_completions?.length || 0;
    return 66 - completions;
  };

  const needsReflection = (habit: any) => {
    if (!habit.habit_reflections || habit.habit_reflections.length === 0) return true;
    
    const reflections = habit.habit_reflections || [];
    const latestReflection = reflections.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    if (!latestReflection) return true;
    
    const daysSinceLastReflection = differenceInDays(
      new Date(), 
      new Date(latestReflection.created_at)
    );
    
    return daysSinceLastReflection >= 7;
  };

  return (
    <div className="space-y-4">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{habit.name}</h3>
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">{getStreakCount(habit)}</span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
        </div>
        <div className={`flex ${isMobile ? 'justify-start' : 'items-center'} gap-2 flex-wrap`}>
          <EditHabitDialog habit={habit} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 relative"
            onClick={() => onReflectionClick(habit)}
          >
            <BellDot className={`h-4 w-4 ${
              needsReflection(habit) 
                ? "text-red-500" 
                : "text-gray-700"
            }`} />
            {needsReflection(habit) && (
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onSatisfactionClick(habit)}
          >
            <Star className={`h-4 w-4 ${habit.satisfaction_level === 'high' ? 'text-yellow-400' : 'text-gray-400'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              if (!isCompletedToday(habit)) {
                onCompletionClick(habit);
              }
            }}
          >
            <CheckCircle 
              className={`h-4 w-4 ${isCompletedToday(habit) ? "text-green-500" : "text-gray-400"}`} 
            />
          </Button>
        </div>
      </div>
      <Progress value={calculateProgress(habit)} className="h-2" />
      <div className={`${isMobile ? 'flex flex-col space-y-1' : 'flex justify-between'} text-sm text-gray-600`}>
        <span>Fortschritt: {calculateProgress(habit)}%</span>
        <span>
          Noch {getRemainingDays(habit)} Tage bis zum Automatismus
        </span>
      </div>
    </div>
  );
};
