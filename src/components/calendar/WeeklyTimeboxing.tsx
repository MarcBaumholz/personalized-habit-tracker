import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfWeek, addDays, getISOWeek, parse } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDroppable } from "@dnd-kit/core";

interface TimeSlot {
  time: string;
  activities: {
    [key: string]: {
      id: string;
      title: string;
      category?: string;
      type: 'todo' | 'habit';
    };
  };
}

const TIME_SLOTS: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, "0")}:00`,
  activities: {}
}));

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
  const [view, setView] = useState(preferences?.default_view || 'week');
  const isMobile = useIsMobile();
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from(
    { length: view === 'week' ? 5 : 1 }, 
    (_, i) => addDays(weekStart, i)
  );

  const startTime = preferences?.start_time ? 
    parseInt(preferences.start_time.split(':')[0], 10) : 0;
  const endTime = preferences?.end_time ? 
    parseInt(preferences.end_time.split(':')[0], 10) : 23;

  const visibleTimeSlots = TIME_SLOTS.slice(startTime, endTime + 1);

  const getDroppableId = (time: string, x: number, y: number) => {
    return `${time}-${x}:${y}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-800 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            {format(weekStart, "MMMM yyyy", { locale: de })}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addDays(currentWeek, -7))} className="hover:bg-blue-50 border-blue-200">
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          </Button>
          <span className="font-medium text-sm md:text-base text-blue-800">
            KW {getISOWeek(weekStart)}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentWeek(addDays(currentWeek, 7))} className="hover:bg-blue-50 border-blue-200">
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="grid grid-cols-[80px_repeat(5,1fr)] min-w-[800px]">
          <div className="sticky left-0 bg-white z-10">
            {visibleTimeSlots.map((slot) => (
              <div key={slot.time} className="h-20 border-b border-r px-2 py-1">
                <span className="text-sm text-gray-500">{slot.time}</span>
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => (
            <div key={day.toISOString()} className="relative">
              <div className="h-12 border-b p-2 sticky top-0 bg-white z-10">
                <div className="text-sm font-medium">
                  {format(day, "EEEE", { locale: de })}
                </div>
                <div className="text-sm text-gray-500">
                  {format(day, "dd.MM.", { locale: de })}
                </div>
              </div>

              {visibleTimeSlots.map((slot, timeIndex) => {
                const { setNodeRef } = useDroppable({
                  id: getDroppableId(slot.time, dayIndex, timeIndex)
                });

                return (
                  <div
                    key={`${day.toISOString()}-${slot.time}`}
                    ref={setNodeRef}
                    className="h-20 border-b border-r px-2 py-1 relative group"
                  >
                    {schedules
                      .filter(schedule => 
                        format(new Date(schedule.scheduled_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
                        schedule.scheduled_time === slot.time
                      )
                      .map(schedule => (
                        <div
                          key={schedule.id}
                          style={{
                            position: 'absolute',
                            left: `${schedule.position_x || 0}px`,
                            top: `${schedule.position_y || 0}px`
                          }}
                          className="bg-blue-100 rounded p-2 text-sm"
                        >
                          {schedule.habits.name}
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
