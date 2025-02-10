
import { Flame } from "lucide-react";

interface HabitHeaderProps {
  name: string;
  completedDays: number;
}

export const HabitHeader = ({ name, completedDays }: HabitHeaderProps) => {
  return (
    <div>
      <h3 className="font-medium text-gray-900">{name}</h3>
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <span>{completedDays}</span>
        {[...Array(4)].map((_, i) => (
          <Flame key={i} className="w-4 h-4 text-orange-500" />
        ))}
      </div>
    </div>
  );
};
