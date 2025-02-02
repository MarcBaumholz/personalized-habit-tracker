import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface HabitProgressProps {
  data: Array<{ id: string; name: string; completions: number }>;
}

export const HabitProgress = ({ data }: HabitProgressProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Gewohnheiten Fortschritt</h2>
      <div className="space-y-6">
        {data.map((habit) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{habit.name}</span>
              <span>{habit.completions}/66 Tage</span>
            </div>
            <Progress value={(habit.completions / 66) * 100} />
          </div>
        ))}
      </div>
    </Card>
  );
};