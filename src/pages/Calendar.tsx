
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { ScheduleDialog } from "@/components/calendar/ScheduleDialog";
import { ScheduleList } from "@/components/calendar/ScheduleList";
import { WeeklyTimeboxing } from "@/components/calendar/WeeklyTimeboxing";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useTodos } from "@/hooks/useTodos";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DEFAULT_PREFERENCES = {
  start_time: '06:00:00',
  end_time: '21:00:00',
  default_view: 'week'
};

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string>("");
  const [selectedTodo, setSelectedTodo] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<"habit" | "todo">("habit");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { todos } = useTodos();

  const { data: habits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);

      return data || [];
    },
  });

  const { data: schedules } = useQuery({
    queryKey: ["habit-schedules", date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habit_schedules")
        .select(`
          *,
          habits (
            id,
            name,
            category
          )
        `)
        .eq("user_id", user.id)
        .eq("scheduled_date", format(date || new Date(), "yyyy-MM-dd"));

      return data || [];
    },
  });

  const { data: todoSchedules } = useQuery({
    queryKey: ["todo-schedules", date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .not("scheduled_time", "is", null);

      return data || [];
    },
  });

  const { data: calendarPreferences } = useQuery({
    queryKey: ["calendar-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("calendar_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      return data || DEFAULT_PREFERENCES;
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-schedules"] });
      toast({
        title: "Zeitplan aktualisiert",
        description: "Der Zeitplan wurde erfolgreich aktualisiert.",
      });
    },
  });

  const updateTodoScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("todos")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todo-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({
        title: "Todo aktualisiert",
        description: "Das Todo wurde erfolgreich eingeplant.",
      });
    },
  });

  const createHabitScheduleMutation = useMutation({
    mutationFn: async ({ habitId, time, day }: { habitId: string, time: string, day: Date }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .insert({
          user_id: user.id,
          habit_id: habitId,
          scheduled_date: format(day, "yyyy-MM-dd"),
          scheduled_time: time,
          position_x: 5,
          position_y: 5
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-schedules"] });
      setIsScheduleDialogOpen(false);
      setSelectedHabit("");
      setSelectedTime("");
      toast({
        title: "Gewohnheit eingeplant",
        description: "Die Gewohnheit wurde erfolgreich eingeplant.",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Extract time and position from the drop-zone ID
    const [time, position] = over.id.toString().split('-');
    
    // Check if this is a todo or a habit
    const itemId = active.id.toString();
    const itemType = active.data?.current?.type;
    
    if (itemType === 'todo') {
      // It's a todo being dragged
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
      // It's a habit being dragged
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

  const handleTimeSlotClick = (time: string, day: Date) => {
    setSelectedTime(time);
    setSelectedDay(day);
    setIsScheduleDialogOpen(true);
  };

  const handleSchedule = () => {
    if (scheduleType === "habit" && selectedHabit && selectedTime && selectedDay) {
      createHabitScheduleMutation.mutate({
        habitId: selectedHabit,
        time: selectedTime,
        day: selectedDay
      });
    } else if (scheduleType === "todo" && selectedTodo && selectedTime && selectedDay) {
      updateTodoScheduleMutation.mutate({
        id: selectedTodo,
        updates: {
          scheduled_time: selectedTime,
          scheduled_date: format(selectedDay, "yyyy-MM-dd"),
          position_x: 5,
          position_y: 5
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <DndContext onDragEnd={handleDragEnd}>
        <main className="container py-8 px-4 md:px-6 lg:px-8">
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-blue-800">Kalenderansicht</h1>
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
              <div className="space-y-6">
                <Card className="p-6">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    locale={de}
                  />
                </Card>

                <Card className="p-6">
                  <ScheduleList
                    date={date}
                    schedules={schedules}
                    todos={todos}
                    habits={habits}
                    isDraggable
                  />
                </Card>
              </div>
              
              <Card className="p-6">
                <WeeklyTimeboxing
                  date={date}
                  schedules={schedules}
                  todos={todoSchedules}
                  preferences={calendarPreferences}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              </Card>
            </div>
          </div>
        </main>
      </DndContext>

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Termin einplanen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Typ</label>
              <div className="flex space-x-2">
                <Button 
                  variant={scheduleType === "habit" ? "default" : "outline"} 
                  onClick={() => setScheduleType("habit")}
                >
                  Gewohnheit
                </Button>
                <Button 
                  variant={scheduleType === "todo" ? "default" : "outline"} 
                  onClick={() => setScheduleType("todo")}
                >
                  Todo
                </Button>
              </div>
            </div>

            {scheduleType === "habit" ? (
              <div>
                <label className="block text-sm font-medium mb-1">Gewohnheit</label>
                <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gewohnheit auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {habits?.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">Todo</label>
                <Select value={selectedTodo} onValueChange={setSelectedTodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todo auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {todos?.map((todo) => (
                      <SelectItem key={todo.id} value={todo.id}>
                        {todo.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Datum & Zeit</label>
              <div className="text-sm mb-2">
                {selectedDay ? format(selectedDay, "dd.MM.yyyy", { locale: de }) : "Kein Datum ausgewählt"} {selectedTime}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={handleSchedule} 
                disabled={(scheduleType === "habit" && !selectedHabit) || 
                          (scheduleType === "todo" && !selectedTodo) || 
                          !selectedTime || 
                          !selectedDay}
              >
                Einplanen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
