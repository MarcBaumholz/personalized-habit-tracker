import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";

interface Schedule {
  id: string;
  scheduled_time: string;
  habits: {
    name: string;
  };
}

interface ScheduleListProps {
  date: Date | undefined;
  schedules: Schedule[] | undefined;
}

export const ScheduleList = ({ date, schedules }: ScheduleListProps) => {
  const sortedSchedules = schedules?.sort((a, b) => 
    (a.scheduled_time || "").localeCompare(b.scheduled_time || "")
  );

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Tagesplan für {date ? format(date, "dd. MMMM yyyy", { locale: de }) : ""}
        </h2>
      </div>

      <div className="space-y-4">
        {sortedSchedules?.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50 cursor-move"
            draggable
          >
            <span className="font-medium min-w-[60px]">
              {schedule.scheduled_time}
            </span>
            <div className="flex-1 p-2 rounded">
              <span>{schedule.habits?.name}</span>
            </div>
          </div>
        ))}
        {!sortedSchedules?.length && (
          <p className="text-center text-gray-500">
            Keine Gewohnheiten für diesen Tag geplant
          </p>
        )}
      </div>
    </Card>
  );
};