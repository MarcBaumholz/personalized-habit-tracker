
import { cn } from "@/lib/utils";

interface HabitProgressProps {
  completedDays: number;
  totalDays: number;
  remainingDays: number;
}

export const HabitProgress = ({ completedDays, totalDays, remainingDays }: HabitProgressProps) => {
  return (
    <>
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
    </>
  );
};
