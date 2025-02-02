import { Button } from "@/components/ui/button";
import { Flame, Circle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const progress = calculateProgress(habit);
  const totalDays = 66;
  const completedDays = habit.habit_completions?.length || 0;
  const remainingDays = totalDays - completedDays;
  
  // Calculate if reflection is needed (7 days since last reflection)
  const lastReflection = habit.habit_reflections?.sort((a: any, b: any) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0];
  
  const needsReflection = lastReflection ? 
    (new Date().getTime() - new Date(lastReflection.created_at).getTime()) / (1000 * 60 * 60 * 24) >= 7 
    : false;

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
    </div>
  );
};