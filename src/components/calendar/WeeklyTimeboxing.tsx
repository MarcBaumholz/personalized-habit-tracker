import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { de } from "date-fns/locale";

interface TimeSlot {
  time: string;
  activities: {
    [key: string]: string; // day -> activity
  };
}

const TIME_SLOTS: TimeSlot[] = Array.from({ length: 36 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
  const minute = i % 2 === 0 ? "00" : "30";
  const nextHour = minute === "30" ? hour + 1 : hour;
  const nextMinute = minute === "30" ? "00" : "30";
  
  return {
    time: `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`,
    activities: {}
  };
});

export const WeeklyTimeboxing = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const previousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Wochenplan</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(weekStart, "dd. MMMM yyyy", { locale: de })}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-1 mb-2">
            <div className="font-medium">Zeit</div>
            {weekDays.map(day => (
              <div key={day.toString()} className="font-medium text-center">
                {format(day, "EEE", { locale: de })}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot.time}
                className="grid grid-cols-[120px_repeat(5,1fr)] gap-1"
              >
                <div className="text-sm py-2 px-2 bg-gray-50 rounded">
                  {slot.time}
                </div>
                {weekDays.map(day => (
                  <div
                    key={day.toString()}
                    className="bg-gray-50 rounded min-h-[40px] p-1 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      // TODO: Implement activity assignment dialog
                    }}
                  >
                    {slot.activities[format(day, "yyyy-MM-dd")] || ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};