import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, startOfWeek, addDays, getISOWeek, addWeeks, subWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TimeCell } from "./TimeCell";
import { TimeHeader } from "./TimeHeader";
import { ScheduleDialog } from "./ScheduleDialog";

interface TimeSlot {
  time: string;
  displayTime: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { time: "06:00", displayTime: "06:00 - 07:00" },
  { time: "07:00", displayTime: "07:00 - 08:00" },
  { time: "08:00", displayTime: "08:00 - 09:00" },
  { time: "09:00", displayTime: "09:00 - 10:00" },
  { time: "10:00", displayTime: "10:00 - 11:00" },
  { time: "11:00", displayTime: "11:00 - 12:00" },
  { time: "12:00", displayTime: "12:00 - 13:00" },
  { time: "13:00", displayTime: "13:00 - 14:00" },
  { time: "14:00", displayTime: "14:00 - 15:00" },
  { time: "15:00", displayTime: "15:00 - 16:00" },
  { time: "16:00", displayTime: "16:00 - 17:00" },
  { time: "17:00", displayTime: "17:00 - 18:00" },
  { time: "18:00", displayTime: "18:00 - 19:00" },
  { time: "19:00", displayTime: "19:00 - 20:00" },
  { time: "20:00", displayTime: "20:00 - 21:00" },
  { time: "21:00", displayTime: "21:00 - 22:00" },
];

interface WeeklyTimeboxingProps {
  date?: Date;
  schedules?: any[];
  todos?: any[];
  habits?: any[];
  onTimeSlotClick?: (time: string, date: Date) => void;
  preferences?: {
    start_time: string;
    end_time: string;
    default_view: string;
  };
  onScheduleHabit?: (habit: any, time: string, day: Date) => void;
  onScheduleTodo?: (todo: any, time: string, day: Date) => void;
}

export const WeeklyTimeboxing = ({ 
  date = new Date(), 
  schedules = [], 
  todos = [],
  habits = [],
  onTimeSlotClick,
  preferences,
  onScheduleHabit,
  onScheduleTodo
}: WeeklyTimeboxingProps) => {
  const [currentWeek, setCurrentWeek] = useState(date);
  const [selectedTimeCell, setSelectedTimeCell] = useState<{ time: string, day: Date } | null>(null);
  const [currentView, setCurrentView] = useState<'day' | 'week'>('week');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(weekStart);
  const weekDays = Array.from({ length: currentView === 'week' ? 5 : 1 }, (_, i) => 
    currentView === 'week' ? addDays(weekStart, i) : currentWeek
  );

  const startTime = preferences?.start_time ? 
    parseInt(preferences.start_time.split(':')[0], 10) : 6;
  const endTime = preferences?.end_time ? 
    parseInt(preferences.end_time.split(':')[0], 10) : 21;

  const visibleTimeSlots = TIME_SLOTS.filter(slot => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour >= startTime && hour <= endTime;
  });

  const handlePrevNavigate = () => {
    if (currentView === 'week') {
      setCurrentWeek(subWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addDays(currentWeek, -1));
    }
  };

  const handleNextNavigate = () => {
    if (currentView === 'week') {
      setCurrentWeek(addWeeks(currentWeek, 1));
    } else {
      setCurrentWeek(addDays(currentWeek, 1));
    }
  };

  const handleCellClick = (time: string, day: Date) => {
    setSelectedTimeCell({ time, day });
    setDialogOpen(true);
    
    if (onTimeSlotClick) {
      onTimeSlotClick(time, day);
    }
  };

  const handleScheduleHabit = (habit: any, time: string, day: Date) => {
    if (onScheduleHabit) {
      onScheduleHabit(habit, time, day);
      
      toast({
        title: "Gewohnheit eingeplant",
        description: `${habit.name} wurde für ${time} Uhr eingeplant.`,
      });
    }
  };

  const handleScheduleTodo = (todo: any, time: string, day: Date) => {
    if (onScheduleTodo) {
      onScheduleTodo(todo, time, day);
      
      toast({
        title: "Todo eingeplant",
        description: `${todo.title} wurde für ${time} Uhr eingeplant.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-blue-800">
            {format(currentWeek, "MMMM yyyy", { locale: de })}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevNavigate} className="hover:bg-blue-50 border-blue-200">
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          </Button>
          <span className="font-medium text-sm md:text-base text-blue-800">
            {currentView === 'week' ? `KW ${weekNumber}` : format(currentWeek, "dd.MM.yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextNavigate} className="hover:bg-blue-50 border-blue-200">
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={currentView === 'day' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setCurrentView('day')}
            className={currentView === 'day' ? "bg-blue-600 text-white" : "text-gray-600"}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Tag
          </Button>
          <Button 
            variant={currentView === 'week' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setCurrentView('week')}
            className={currentView === 'week' ? "bg-blue-600 text-white" : "text-gray-600"}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Woche
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className={`grid ${currentView === 'week' ? 'grid-cols-[100px_repeat(5,1fr)]' : 'grid-cols-[100px_1fr]'} min-w-[600px] border rounded-lg bg-white`}>
          <div className="border-b border-r py-4 bg-blue-50 text-center font-medium">
            Zeit
          </div>

          {weekDays.map((day) => (
            <TimeHeader key={day.toISOString()} day={day} />
          ))}

          {visibleTimeSlots.map((slot) => (
            <React.Fragment key={`timeslot-${slot.time}`}>
              <div className="border-b border-r py-4 px-2 h-20 text-blue-600 text-center">
                {slot.displayTime}
              </div>

              {weekDays.map((day) => (
                <TimeCell
                  key={`${day.toISOString()}-${slot.time}`}
                  day={day}
                  time={slot.time}
                  schedules={schedules}
                  todos={todos}
                  onClick={handleCellClick}
                  isSelected={
                    selectedTimeCell?.time === slot.time && 
                    format(selectedTimeCell.day, "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                  }
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <ScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedTime={selectedTimeCell?.time || null}
        selectedDay={selectedTimeCell?.day || null}
        habits={habits || []}
        todos={todos || []}
        onScheduleHabit={handleScheduleHabit}
        onScheduleTodo={handleScheduleTodo}
        schedules={schedules}
        scheduledTodos={todos}
      />
    </div>
  );
};
