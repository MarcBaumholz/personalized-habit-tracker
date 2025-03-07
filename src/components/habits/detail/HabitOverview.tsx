
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HabitOverviewProps {
  identity: string;
  context: string;
  smartGoal: string;
}

export const HabitOverview = ({ identity, context, smartGoal }: HabitOverviewProps) => {
  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
        <CardTitle className="text-blue-700">Übersicht</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium mb-1 text-blue-700">Identität</h3>
            <p className="text-sm text-gray-700">{identity || "Keine Angabe"}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium mb-1 text-blue-700">Kontext & Trigger</h3>
            <p className="text-sm text-gray-700">{context || "Keine Angabe"}</p>
          </div>

          <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-medium mb-1 text-blue-700">SMART Ziel</h3>
            <p className="text-sm text-gray-700">{smartGoal || "Keine Angabe"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
