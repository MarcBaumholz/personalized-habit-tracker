import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BellDot, Flame } from "lucide-react";
import { differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, format as formatDateFns } from 'date-fns';
import { de } from 'date-fns/locale';
import { EditHabitDialog } from "./EditHabitDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { WeeklyDayTracker, DayStatus } from './WeeklyDayTracker';
import { cn } from "@/lib/utils";

interface HabitRowProps {
  habit: any;
  onReflectionClick: (habit: any) => void;
  onUpdateWeeklyCompletion: (habitId: string, date: Date, newStatus: DayStatus) => void;
}

export const HabitRow = ({
  habit,
  onReflectionClick,
  onUpdateWeeklyCompletion,
}: HabitRowProps) => {
  const isMobile = useIsMobile();

  const calculateProgress = (habit: any) => {
    const completions = habit.habit_completions?.length || 0;
    return Math.round((completions / 66) * 100);
  };

  const getStreakCount = (habit: any) => {
    return habit.streak_count || 0;
  };

  const getRemainingDays = (habit: any) => {
    const completions = habit.habit_completions?.length || 0;
    return Math.max(0, 66 - completions);
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

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1, locale: de }); 
  const weekEnd = endOfWeek(today, { weekStartsOn: 1, locale: de });
  const currentWeekDates = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyCompletionsData = currentWeekDates.map(date => {
    const dateString = formatDateFns(date, 'yyyy-MM-dd');
    const completion = habit.habit_completions?.find(
      (c: any) => c.completed_date === dateString
    );
    return {
      date: dateString,
      status: completion ? (completion.status as DayStatus) : null,
    };
  });

  const handleDayToggle = (date: Date, currentStatus: DayStatus) => {
    console.log(`HabitRow: Day toggle called with date ${formatDateFns(date, 'yyyy-MM-dd')} and current status: ${currentStatus}`);
    onUpdateWeeklyCompletion(habit.id, date, currentStatus);
  };

  return (
    <div className="space-y-2 py-4 border-b border-gray-200 last:border-b-0">
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
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
        </div>
      </div>
      
      <Progress value={calculateProgress(habit)} className="h-2" />
      <div className={`${isMobile ? 'flex flex-col space-y-1' : 'flex justify-between'} text-sm text-gray-600 mb-2`}>
        <span>Fortschritt: {calculateProgress(habit)}%</span>
        <span>
          Noch {getRemainingDays(habit)} Tage bis zum Automatismus
        </span>
      </div>

      <WeeklyDayTracker
        weekDates={currentWeekDates}
        completions={weeklyCompletionsData}
        onDayToggle={handleDayToggle}
      />
    </div>
  );
};
