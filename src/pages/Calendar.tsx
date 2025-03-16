import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import ScheduleList from "@/components/calendar/ScheduleList";
import { WeeklyTimeboxing } from "@/components/calendar/WeeklyTimeboxing";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useTodos } from "@/hooks/useTodos";
import { Button } from "@/components/ui/button";
import { CalendarRange, Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
      toast({
        title: "Gewohnheit eingeplant",
        description: "Die Gewohnheit wurde erfolgreich eingeplant.",
      });
    },
  });

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

  const handleTimeSlotClick = (time: string, day: Date) => {
    setSelectedTime(time);
    setSelectedDay(day);
  };

  const handleScheduleTodo = (todo: any, time: string, day: Date) => {
    updateTodoScheduleMutation.mutate({
      id: todo.id,
      updates: {
        scheduled_time: time,
        scheduled_date: format(day, "yyyy-MM-dd"),
        position_x: 5,
        position_y: 5
      }
    });
  };

  const handleScheduleHabit = (habit: any, time: string, day: Date) => {
    createHabitScheduleMutation.mutate({
      habitId: habit.id,
      time: time,
      day: day
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <DndContext onDragEnd={handleDragEnd}>
        <main className="container py-6 px-4 md:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-blue-800 flex items-center">
                <CalendarRange className="h-8 w-8 mr-2 text-blue-600" />
                Kalenderansicht
              </h1>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Einstellungen</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Kalendereinstellungen</h4>
                      <p className="text-sm text-muted-foreground">
                        Passen Sie die Anzeige des Kalenders an
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="startTime">Startzeit</label>
                        <input
                          id="startTime"
                          type="time"
                          className="col-span-2 h-8 rounded-md border border-input bg-background px-3"
                          defaultValue={calendarPreferences?.start_time?.slice(0, 5) || "06:00"}
                        />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <label htmlFor="endTime">Endzeit</label>
                        <input
                          id="endTime"
                          type="time"
                          className="col-span-2 h-8 rounded-md border border-input bg-background px-3"
                          defaultValue={calendarPreferences?.end_time?.slice(0, 5) || "21:00"}
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
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
                />
              </div>
              
              <Card className="p-4 shadow-sm border-blue-100">
                <WeeklyTimeboxing
                  date={date}
                  schedules={schedules}
                  todos={todoSchedules}
                  habits={habits}
                  preferences={calendarPreferences}
                  onTimeSlotClick={handleTimeSlotClick}
                  onScheduleHabit={handleScheduleHabit}
                  onScheduleTodo={handleScheduleTodo}
                />
              </Card>
            </div>
          </div>
        </main>
      </DndContext>
    </div>
  );
};

export default Calendar;
