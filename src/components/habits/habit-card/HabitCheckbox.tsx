
import { Circle, Check } from "lucide-react";

interface HabitCheckboxProps {
  isCompleted: boolean;
  onComplete: () => void;
}

export const HabitCheckbox = ({ isCompleted, onComplete }: HabitCheckboxProps) => {
  return (
    <button
      onClick={onComplete}
      className="relative w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center transition-colors"
    >
      {isCompleted ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <Circle className="w-5 h-5 text-gray-300" />
      )}
    </button>
  );
};
