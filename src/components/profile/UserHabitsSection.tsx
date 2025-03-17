
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Circle } from "lucide-react";

interface Habit {
  id: string;
  name: string;
  category: string;
  is_keystone?: boolean;
  minimal_dose?: string | null;
  life_area?: string | null;
}

interface UserHabitsSectionProps {
  habits: Habit[];
}

export const UserHabitsSection = ({ habits }: UserHabitsSectionProps) => {
  return (
    <Card className="p-6 bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Meine Gewohnheiten</h3>
      
      {habits.length === 0 ? (
        <p className="text-muted-foreground">Noch keine Gewohnheiten angelegt.</p>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div 
              key={habit.id} 
              className="p-3 border rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{habit.name}</span>
                {habit.is_keystone && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Keystone
                  </Badge>
                )}
                {habit.minimal_dose && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                    <Circle className="h-3 w-3 text-yellow-500 fill-yellow-500">
                      <Minus className="h-3 w-3 text-yellow-800" />
                    </Circle>
                    Minimal
                  </Badge>
                )}
              </div>
              
              {habit.life_area && (
                <Badge variant="secondary" className="bg-gray-100">
                  {habit.life_area}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
