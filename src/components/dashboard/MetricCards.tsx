import { Card } from "@/components/ui/card";
import { Trophy, Target, Calendar, Award } from "lucide-react";

interface MetricCardsProps {
  streak: number;
  successRate: number;
  activeDays: number;
  totalProgress: number;
}

export const MetricCards = ({ streak, successRate, activeDays, totalProgress }: MetricCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Aktuelle Streak</p>
          <p className="text-2xl font-bold">{streak} Tage</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Target className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Erfolgsquote</p>
          <p className="text-2xl font-bold">{successRate}%</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Calendar className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Aktive Tage</p>
          <p className="text-2xl font-bold">{activeDays}/30</p>
        </div>
      </Card>

      <Card className="p-4 flex items-center space-x-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Award className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Level</p>
          <p className="text-2xl font-bold">{Math.floor(totalProgress / 10) + 1}</p>
        </div>
      </Card>
    </div>
  );
};