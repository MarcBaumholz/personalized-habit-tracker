
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HabitOverviewProps {
  identity: string;
  context: string;
  smartGoal: string;
}

export const HabitOverview = ({ identity, context, smartGoal }: HabitOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Übersicht</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-1">Identität</h3>
            <p className="text-sm text-gray-700">{identity || "Keine Angabe"}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-1">Kontext & Trigger</h3>
            <p className="text-sm text-gray-700">{context || "Keine Angabe"}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-md">
            <h3 className="font-medium mb-1">SMART Ziel</h3>
            <p className="text-sm text-gray-700">{smartGoal || "Keine Angabe"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
