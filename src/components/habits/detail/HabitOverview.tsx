
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Clock, Calendar, TrendingUp } from "lucide-react";

interface HabitOverviewProps {
  identity: string;
  context: string;
  smartGoal: string;
  frequency?: string;
  category?: string;
  streakCount?: number;
  difficulty?: string;
}

export const HabitOverview = ({ 
  identity, 
  context, 
  smartGoal, 
  frequency = "daily", 
  category = "", 
  streakCount = 0,
  difficulty = "medium"
}: HabitOverviewProps) => {
  // Map category values to user-friendly labels
  const categoryMap: Record<string, { label: string, color: string }> = {
    "career": { label: "Karriere", color: "bg-blue-100 text-blue-800" },
    "health": { label: "Gesundheit", color: "bg-green-100 text-green-800" },
    "relationships": { label: "Beziehungen", color: "bg-purple-100 text-purple-800" },
    "personal": { label: "Persönliche Entwicklung", color: "bg-amber-100 text-amber-800" }
  };

  const frequencyMap: Record<string, string> = {
    "daily": "Täglich",
    "weekly": "Wöchentlich",
    "workdays": "Werktags"
  };

  const difficultyMap: Record<string, { label: string, color: string }> = {
    "easy": { label: "Leicht", color: "bg-green-100 text-green-800" },
    "medium": { label: "Mittel", color: "bg-yellow-100 text-yellow-800" },
    "hard": { label: "Schwer", color: "bg-red-100 text-red-800" }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="text-blue-700">Übersicht</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {category && categoryMap[category] && (
            <Badge variant="outline" className={categoryMap[category].color}>
              {categoryMap[category].label}
            </Badge>
          )}
          
          {frequency && (
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              <Clock className="mr-1 h-3 w-3" />
              {frequencyMap[frequency] || frequency}
            </Badge>
          )}
          
          {difficulty && difficultyMap[difficulty] && (
            <Badge variant="outline" className={difficultyMap[difficulty].color}>
              {difficultyMap[difficulty].label}
            </Badge>
          )}
          
          {streakCount > 0 && (
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              <TrendingUp className="mr-1 h-3 w-3" />
              {streakCount} Tage Streak
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium mb-2 text-blue-700">Identität</h3>
            <p className="text-sm text-gray-700">{identity || "Keine Angabe"}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium mb-2 text-blue-700">Kontext & Trigger</h3>
            <p className="text-sm text-gray-700">{context || "Keine Angabe"}</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium mb-2 text-blue-700">SMART Ziel</h3>
            <p className="text-sm text-gray-700">{smartGoal || "Keine Angabe"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
