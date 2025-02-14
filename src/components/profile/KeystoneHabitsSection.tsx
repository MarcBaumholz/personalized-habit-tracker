
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KeystoneHabit {
  id: string;
  habit_name: string;
  description: string;
  frequency: string;
  user_id: string;
}

interface KeystoneHabitsSectionProps {
  habits: KeystoneHabit[];
}

export const KeystoneHabitsSection = ({ habits }: KeystoneHabitsSectionProps) => {
  if (!habits || habits.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-800">
          Deine Keystone Habits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {habits.map((habit) => (
          <div key={habit.id} className="border-l-4 border-blue-500 pl-4 py-2">
            <h3 className="font-semibold text-lg text-blue-700">{habit.habit_name}</h3>
            <p className="text-gray-600 mt-1">{habit.description}</p>
            <p className="text-sm text-gray-500 mt-2">Häufigkeit: {habit.frequency}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
