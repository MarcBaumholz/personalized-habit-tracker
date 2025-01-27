import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";

const HABIT_TOOLKITS = [
  {
    id: "smart",
    title: "SMART Goals",
    description: "Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert",
  },
  {
    id: "stacking",
    title: "Habit Stacking",
    description: "Neue Gewohnheiten an bestehende Routinen knüpfen",
  },
  {
    id: "environment",
    title: "Umgebungsdesign",
    description: "Optimiere deine Umgebung für erfolgreiche Gewohnheiten",
  },
];

export const HabitEducation = () => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-primary">Habit Baukasten</h2>
      </div>
      
      <p className="text-text-secondary">
        Wähle aus verschiedenen bewährten Methoden, um deine Gewohnheiten zu optimieren.
      </p>

      <div className="grid gap-4">
        {HABIT_TOOLKITS.map((toolkit) => (
          <div
            key={toolkit.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 className="font-medium">{toolkit.title}</h3>
              <p className="text-sm text-text-secondary">{toolkit.description}</p>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Anwenden
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};