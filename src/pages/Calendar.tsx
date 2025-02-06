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

  const handleSchedule = () => {
    if (selectedHabit && selectedTime) {
      scheduleHabitMutation.mutate({
        habitId: selectedHabit,
        time: selectedTime,
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kalenderansicht</h1>
          <ScheduleDialog
            habits={habits}
            selectedHabit={selectedHabit}
            selectedTime={selectedTime}
            onHabitChange={setSelectedHabit}
            onTimeChange={setSelectedTime}
            onSchedule={handleSchedule}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Card className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={de}
            />
          </Card>

          <ScheduleList date={date} schedules={schedules} />
        </div>

        <WeeklyTimeboxing />
      </main>
    </div>
  );
};

export default Calendar;