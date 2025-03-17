
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Reflection {
  id: string;
  habit_id: string;
  user_id: string;
  reflection_text: string;
  srhi_score?: number;
  created_at: string;
}

interface PastReflectionsProps {
  reflections: Reflection[];
}

export const PastReflections = ({ reflections }: PastReflectionsProps) => {
  if (!reflections || reflections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vergangene Reflexionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
            Du hast noch keine Reflexionen eingetragen.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vergangene Reflexionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reflections.map((reflection) => (
            <div key={reflection.id} className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {format(new Date(reflection.created_at), "d. MMMM", { locale: de })}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(reflection.created_at), "HH:mm")}
                </span>
              </div>
              <p className="text-sm text-gray-700">{reflection.reflection_text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
