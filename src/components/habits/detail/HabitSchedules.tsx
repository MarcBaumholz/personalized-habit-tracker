
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2 } from "lucide-react";

interface HabitSchedulesProps {
  schedules: any[];
}

export const HabitSchedules = ({ schedules }: HabitSchedulesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Planungen</span>
          <Button size="sm" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Planen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules && schedules.length > 0 ? (
          <div className="space-y-3">
            {schedules.map((schedule: any) => (
              <div key={schedule.id} className="p-3 bg-blue-50 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{new Date(schedule.scheduled_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{schedule.scheduled_time || "Keine Zeit festgelegt"}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Keine Planungen vorhanden</p>
            <p className="text-sm">Plane deine Gewohnheit im Kalender</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
