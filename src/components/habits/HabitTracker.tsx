import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const HabitTracker = () => {
  return (
    <Card className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Deine Gewohnheiten</h2>
        <Select defaultValue="today">
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Heute</SelectItem>
            <SelectItem value="week">Diese Woche</SelectItem>
            <SelectItem value="month">Dieser Monat</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Deep Work</h3>
              <p className="text-sm text-text-secondary">7 Tage Streak</p>
            </div>
            <Button size="sm" variant="ghost">
              <CheckCircle className="h-5 w-5" />
            </Button>
          </div>
          <Progress value={70} className="h-2" />
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Fortschritt: 70%</span>
            <span>Noch 20 Tage bis zum Automatismus</span>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Meditation</h3>
              <p className="text-sm text-text-secondary">3 Tage Streak</p>
            </div>
            <Button size="sm" variant="ghost">
              <CheckCircle className="h-5 w-5" />
            </Button>
          </div>
          <Progress value={30} className="h-2" />
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Fortschritt: 30%</span>
            <span>Noch 46 Tage bis zum Automatismus</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button className="w-full" variant="outline">
          Neue Gewohnheit hinzufügen
        </Button>
      </div>
    </Card>
  );
};