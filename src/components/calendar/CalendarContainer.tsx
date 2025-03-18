
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { de } from "date-fns/locale";
import { useTodos } from "@/hooks/useTodos";
import { format } from "date-fns";
import { useCalendarData } from "@/hooks/useCalendarData";
import { CalendarHeader } from "./CalendarHeader";
import ScheduleList from "@/components/calendar/ScheduleList";
import { WeeklyTimeboxing } from "@/components/calendar/WeeklyTimeboxing";
import { useToast } from "@/hooks/use-toast";

export const CalendarContainer = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { todos } = useTodos();
  const { toast } = useToast();
  
  const {
    habits,
    schedules,
    todoSchedules,
    calendarPreferences,
    handleTimeSlotClick,
    handleScheduleTodo,
    handleScheduleHabit,
    handleSavePreferences,
    updateScheduleMutation,
    updateTodoScheduleMutation,
    deleteScheduleMutation,
    deleteTodoScheduleMutation
  } = useCalendarData(date);

  // Handle drag and drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const [time, position] = over.id.toString().split('-');
    
    const itemId = active.id.toString();
    const itemType = active.data?.current?.type;
    
    if (itemType === 'todo') {
      updateTodoScheduleMutation.mutate({
        id: itemId,
        updates: {
          scheduled_time: time,
          scheduled_date: format(date || new Date(), "yyyy-MM-dd"),
          position_x: parseInt(position.split(':')[0]),
          position_y: parseInt(position.split(':')[1])
        }
      });
    } else {
      updateScheduleMutation.mutate({
        id: itemId,
        updates: {
          scheduled_time: time,
          position_x: parseInt(position.split(':')[0]),
          position_y: parseInt(position.split(':')[1])
        }
      });
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    deleteScheduleMutation.mutate(scheduleId, {
      onSuccess: () => {
        toast({
          title: "Termin gelöscht",
          description: "Der Termin wurde erfolgreich gelöscht."
        });
      }
    });
  };

  const handleDeleteTodo = (todoId: string) => {
    deleteTodoScheduleMutation.mutate(todoId, {
      onSuccess: () => {
        toast({
          title: "Todo-Termin gelöscht", 
          description: "Der geplante Todo-Termin wurde erfolgreich gelöscht."
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <DndContext onDragEnd={handleDragEnd}>
        <main className="container py-6 px-4 md:px-6 lg:px-8">
          <div className="space-y-6">
            <CalendarHeader 
              calendarPreferences={calendarPreferences}
              onSavePreferences={handleSavePreferences}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
              <div className="space-y-6">
                <Card className="p-4 shadow-sm border-blue-100">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    locale={de}
                  />
                </Card>

                <ScheduleList
                  date={date}
                  schedules={schedules}
                  todos={todos}
                  habits={habits}
                  isDraggable
                  onScheduleTodo={handleScheduleTodo}
                  onScheduleHabit={handleScheduleHabit}
                  onDeleteSchedule={handleDeleteSchedule}
                  onDeleteTodo={handleDeleteTodo}
                />
              </div>
              
              <Card className="p-4 shadow-sm border-blue-100">
                <WeeklyTimeboxing
                  date={date}
                  schedules={schedules}
                  todos={todoSchedules}
                  habits={habits}
                  activeTodos={todos}
                  preferences={calendarPreferences}
                  onTimeSlotClick={handleTimeSlotClick}
                  onScheduleHabit={handleScheduleHabit}
                  onScheduleTodo={handleScheduleTodo}
                  onDeleteSchedule={handleDeleteSchedule}
                  onDeleteTodo={handleDeleteTodo}
                />
              </Card>
            </div>
          </div>
        </main>
      </DndContext>
    </div>
  );
};
