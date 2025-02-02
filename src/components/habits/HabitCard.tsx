import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, BellDot } from "lucide-react";

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
  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{habit.name}</h3>
          <p className="text-sm text-gray-600">
            {habit.habit_completions?.length || 0} Tage Streak
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => {
              if (!isCompletedToday(habit)) {
                onComplete(habit);
              }
            }}
          >
            <CheckCircle 
              className={`h-5 w-5 ${isCompletedToday(habit) ? "text-green-500" : "text-gray-400"}`} 
            />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReflect(habit)}
          >
            <BellDot className="h-4 w-4 mr-2" />
            Reflektieren
          </Button>
        </div>
      </div>
      <Progress value={calculateProgress(habit)} className="h-2" />
      <div className="flex justify-between text-sm text-gray-600">
        <span>Fortschritt: {calculateProgress(habit)}%</span>
        <span>
          Noch {66 - (habit.habit_completions?.length || 0)} Tage bis zum Automatismus
        </span>
      </div>
    </div>
  );
};