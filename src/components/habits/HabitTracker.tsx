import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export const HabitTracker = () => {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-primary">Deine Gewohnheiten</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Morgenroutine</h3>
            <p className="text-sm text-text-secondary">7 Tage Streak</p>
          </div>
          <Button size="sm" variant="ghost">
            <CheckCircle className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium">Meditation</h3>
            <p className="text-sm text-text-secondary">3 Tage Streak</p>
          </div>
          <Button size="sm" variant="ghost">
            <CheckCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};