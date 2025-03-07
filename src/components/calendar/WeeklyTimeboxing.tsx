
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, getISOWeek, parse, addWeeks, subWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useDroppable } from "@dnd-kit/core";

interface TimeSlot {
  time: string;
  displayTime: string;
  activities: {
    [key: string]: {
      id: string;
      title: string;
      category?: string;
      type: 'todo' | 'habit';
    };
  };
}

const TIME_SLOTS: TimeSlot[] = [
  { time: "06:00", displayTime: "06:00 - 07:00", activities: {} },
  { time: "07:00", displayTime: "07:00 - 08:00", activities: {} },
  { time: "08:00", displayTime: "08:00 - 09:00", activities: {} },
  { time: "09:00", displayTime: "09:00 - 10:00", activities: {} },
  { time: "10:00", displayTime: "10:00 - 11:00", activities: {} },
  { time: "11:00", displayTime: "11:00 - 12:00", activities: {} },
  { time: "12:00", displayTime: "12:00 - 13:00", activities: {} },
  { time: "13:00", displayTime: "13:00 - 14:00", activities: {} },
  { time: "14:00", displayTime: "14:00 - 15:00", activities: {} },
  { time: "15:00", displayTime: "15:00 - 16:00", activities: {} },
  { time: "16:00", displayTime: "16:00 - 17:00", activities: {} },
  { time: "17:00", displayTime: "17:00 - 18:00", activities: {} },
  { time: "18:00", displayTime: "18:00 - 19:00", activities: {} },
  { time: "19:00", displayTime: "19:00 - 20:00", activities: {} },
  { time: "20:00", displayTime: "20:00 - 21:00", activities: {} },
  { time: "21:00", displayTime: "21:00 - 22:00", activities: {} },
];

interface WeeklyTimeboxingProps {
  date?: Date;
  schedules?: any[];
  preferences?: {
    start_time: string;
    end_time: string;
    default_view: string;
  };
}

export const WeeklyTimeboxing = ({ date = new Date(), schedules = [], preferences }: WeeklyTimeboxingProps) => {
  const [currentWeek, setCurrentWeek] = useState(date);
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(weekStart);
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const startTime = preferences?.start_time ? 
    parseInt(preferences.start_time.split(':')[0], 10) : 6;
  const endTime = preferences?.end_time ? 
    parseInt(preferences.end_time.split(':')[0], 10) : 21;

  const visibleTimeSlots = TIME_SLOTS.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour >= startTime && hour <= endTime;
  });

  const getDroppableId = (time: string, x: number, y: number) => {
    return `${time}-${x}:${y}`;
  };

  const handlePrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-800">
            März 2025
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek} className="hover:bg-blue-50 border-blue-200">
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          </Button>
          <span className="font-medium text-sm md:text-base text-blue-800">
            KW {weekNumber}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextWeek} className="hover:bg-blue-50 border-blue-200">
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <div className="bg-white rounded-md px-3 py-1 text-sm text-gray-600">Tag</div>
          <div className="bg-blue-600 rounded-md px-3 py-1 text-sm text-white">Mo-Fr</div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[100px_repeat(5,1fr)] min-w-[800px] border rounded-lg bg-white">
          <div className="border-b border-r py-4 bg-blue-50 text-center font-medium">
            Zeit
          </div>

          {weekDays.map((day, index) => (
            <div key={day.toISOString()} className="border-b py-4 text-center font-medium bg-blue-50">
              <div className="text-blue-700">
                {format(day, "EEEE", { locale: de })}
              </div>
              <div className="text-blue-600">
                {format(day, "dd.MM.", { locale: de })}
              </div>
            </div>
          ))}

          {visibleTimeSlots.map((slot, timeIndex) => (
            <>
              <div 
                key={`time-${slot.time}`} 
                className="border-b border-r py-4 px-2 h-20 text-blue-600 text-center"
              >
                {slot.displayTime}
              </div>

              {weekDays.map((day, dayIndex) => {
                const { setNodeRef } = useDroppable({
                  id: getDroppableId(slot.time, dayIndex, timeIndex)
                });

                const matchingSchedules = schedules.filter(schedule => 
                  format(new Date(schedule.scheduled_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
                  schedule.scheduled_time === slot.time
                );

                const hasSchedule = matchingSchedules.length > 0;
                const bgClass = hasSchedule ? 'bg-green-50' : 'hover:bg-gray-50';

                return (
                  <div
                    key={`${day.toISOString()}-${slot.time}`}
                    ref={setNodeRef}
                    className={`border-b border-r h-20 group ${bgClass}`}
                  >
                    {matchingSchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        style={{
                          position: 'absolute',
                          left: `${schedule.position_x || 0}px`,
                          top: `${schedule.position_y || 0}px`
                        }}
                        className="px-3 py-1 text-sm"
                      >
                        {schedule.habits?.name}
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
};
