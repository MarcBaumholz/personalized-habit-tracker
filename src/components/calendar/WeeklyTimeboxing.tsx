
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Plus, CalendarDays, Check } from "lucide-react";
import { format, startOfWeek, addDays, getISOWeek, addWeeks, subWeeks } from "date-fns";
import { de } from "date-fns/locale";
import { useDroppable } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  const getDroppableId = (time: string, x: number, y: number) => {
    return `${time}-${x}:${y}`;
  };

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
    
    if (onTimeSlotClick) {
      onTimeSlotClick(time, day);
    }
  };

  const handleQuickScheduleHabit = (habit: any) => {
    if (selectedTimeCell && onScheduleHabit) {
      onScheduleHabit(habit, selectedTimeCell.time, selectedTimeCell.day);
      setSelectedTimeCell(null);
      
      toast({
        title: "Gewohnheit eingeplant",
        description: `${habit.name} wurde für ${selectedTimeCell.time} Uhr eingeplant.`,
      });
    }
  };

  const handleQuickScheduleTodo = (todo: any) => {
    if (selectedTimeCell && onScheduleTodo) {
      onScheduleTodo(todo, selectedTimeCell.time, selectedTimeCell.day);
      setSelectedTimeCell(null);
      
      toast({
        title: "Todo eingeplant",
        description: `${todo.title} wurde für ${selectedTimeCell.time} Uhr eingeplant.`,
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
            <React.Fragment key={`timeslot-${slot.time}`}>
              <div className="border-b border-r py-4 px-2 h-20 text-blue-600 text-center">
                {slot.displayTime}
              </div>

              {weekDays.map((day, dayIndex) => {
                const droppableId = getDroppableId(slot.time, dayIndex, timeIndex);
                const { setNodeRef } = useDroppable({
                  id: droppableId
                });

                const matchingSchedules = schedules.filter(schedule => 
                  format(new Date(schedule.scheduled_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
                  schedule.scheduled_time === slot.time
                );

                const matchingTodos = todos.filter(todo => 
                  todo.scheduled_time === slot.time && 
                  format(new Date(todo.scheduled_date || new Date()), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
                );

                const hasItems = matchingSchedules.length > 0 || matchingTodos.length > 0;
                const isSelected = selectedTimeCell && 
                                  selectedTimeCell.time === slot.time && 
                                  format(selectedTimeCell.day, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
                                  
                const bgClass = isSelected 
                  ? 'bg-blue-100 border-2 border-blue-400' 
                  : (hasItems ? 'bg-green-50' : 'hover:bg-gray-50');

                return (
                  <div
                    key={`${day.toISOString()}-${slot.time}`}
                    ref={setNodeRef}
                    className={`border-b border-r h-20 group relative ${bgClass} cursor-pointer transition-colors`}
                    onClick={() => handleCellClick(slot.time, day)}
                  >
                    {matchingSchedules.map(schedule => (
                      <div
                        key={`schedule-${schedule.id}`}
                        style={{
                          position: 'absolute',
                          left: `${schedule.position_x || 5}px`,
                          top: `${schedule.position_y || 5}px`
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 rounded-md shadow-sm"
                      >
                        {schedule.habits?.name || "Gewohnheit"}
                      </div>
                    ))}
                    
                    {matchingTodos.map(todo => (
                      <div
                        key={`todo-${todo.id}`}
                        style={{
                          position: 'absolute',
                          left: `${todo.position_x || 5}px`,
                          top: `${(todo.position_y || 5) + 30}px`
                        }}
                        className="px-3 py-1 text-sm bg-green-100 rounded-md shadow-sm"
                      >
                        {todo.title || "Todo"}
                      </div>
                    ))}

                    {!hasItems && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-6 w-6 text-blue-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Scheduler Dialog */}
      <Dialog open={!!selectedTimeCell} onOpenChange={(open) => !open && setSelectedTimeCell(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Termin für {selectedTimeCell && format(selectedTimeCell.day, "dd.MM.yyyy", { locale: de })} um {selectedTimeCell?.time} Uhr
            </DialogTitle>
            <DialogDescription>
              Wähle eine Gewohnheit oder ein Todo, das du zu diesem Zeitpunkt planen möchtest.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="habits" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="habits">Gewohnheiten</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="habits" className="max-h-[300px] overflow-y-auto">
              {habits && habits.length > 0 ? (
                <div className="space-y-2">
                  {habits.map((habit) => (
                    <div 
                      key={habit.id}
                      className="p-3 bg-blue-50 rounded-md flex justify-between items-center hover:bg-blue-100 cursor-pointer transition-all"
                      onClick={() => handleQuickScheduleHabit(habit)}
                    >
                      <div className="truncate font-medium">{habit.name}</div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={(e) => {
                        e.stopPropagation();
                        handleQuickScheduleHabit(habit);
                      }}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Keine Gewohnheiten verfügbar</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="todos" className="max-h-[300px] overflow-y-auto">
              {todos && todos.filter(todo => !todo.scheduled_time).length > 0 ? (
                <div className="space-y-2">
                  {todos.filter(todo => !todo.scheduled_time).map((todo) => (
                    <div 
                      key={todo.id}
                      className="p-3 bg-green-50 rounded-md flex justify-between items-center hover:bg-green-100 cursor-pointer transition-all"
                      onClick={() => handleQuickScheduleTodo(todo)}
                    >
                      <div className="truncate font-medium">{todo.title}</div>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={(e) => {
                        e.stopPropagation();
                        handleQuickScheduleTodo(todo);
                      }}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>Keine offenen Todos verfügbar</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setSelectedTimeCell(null)}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
