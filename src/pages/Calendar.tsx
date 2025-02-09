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

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        .select("*, habits(*)")
        .eq("user_id", user.id)
        .eq("scheduled_date", format(date || new Date(), "yyyy-MM-dd"));

      return data || [];
    },
  });

  const { data: todos } = useQuery({
    queryKey: ["todos", date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .eq("due_date", format(date || new Date(), "yyyy-MM-dd"));

      return data || [];
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ todoId, time }: { todoId: string, time: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("todos")
        .update({ scheduled_time: time })
        .eq("id", todoId)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const scheduleHabitMutation = useMutation({
    mutationFn: async ({ habitId, time }: { habitId: string, time: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          scheduled_time: time,
          scheduled_date: format(date || new Date(), "yyyy-MM-dd"),
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-schedules"] });
      toast({
        title: "Gewohnheit eingeplant",
        description: "Die Gewohnheit wurde erfolgreich für diesen Tag eingeplant.",
      });
      setSelectedHabit("");
      setSelectedTime("");
    },
  });

  const handleAssignTodo = (todoId: string, time: string) => {
    updateTodoMutation.mutate({ todoId, time });
  };

  const handleAssignHabit = (habitId: string, time: string) => {
    scheduleHabitMutation.mutate({ habitId, time });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 transition-all duration-500">
      <Navigation />
      <main className="container py-8 px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            Kalenderansicht
          </h1>
          <ScheduleDialog
            habits={habits}
            selectedHabit={selectedHabit}
            selectedTime={selectedTime}
            onHabitChange={setSelectedHabit}
            onTimeChange={setSelectedTime}
            onSchedule={() => {
              if (selectedHabit && selectedTime) {
                scheduleHabitMutation.mutate({
                  habitId: selectedHabit,
                  time: selectedTime,
                });
              }
            }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-[350px_1fr]">
          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
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
            onAssignTodo={handleAssignTodo}
            onAssignHabit={handleAssignHabit}
          />
        </div>

        <div className="mt-8">
          <WeeklyTimeboxing />
        </div>
      </main>
    </div>
  );
};

export default Calendar;
