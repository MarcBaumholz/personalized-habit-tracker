
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export const DEFAULT_PREFERENCES = {
  start_time: '06:00:00',
  end_time: '21:00:00',
  default_view: 'week'
};

export const useCalendarData = (date: Date | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Fetch habits
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

  // Fetch schedules for the selected date
  const { data: schedules, refetch: refetchSchedules } = useQuery({
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

  // Fetch scheduled todos
  const { data: todoSchedules, refetch: refetchTodoSchedules } = useQuery({
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

  // Fetch calendar preferences
  const { data: calendarPreferences, refetch: refetchPreferences } = useQuery({
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

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: existingPrefs } = await supabase
        .from("calendar_preferences")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingPrefs) {
        const { data, error } = await supabase
          .from("calendar_preferences")
          .update(preferences)
          .eq("id", existingPrefs.id);

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("calendar_preferences")
          .insert({
            user_id: user.id,
            ...preferences
          });

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      refetchPreferences();
      toast({
        title: "Einstellungen gespeichert",
        description: "Deine Kalendereinstellungen wurden aktualisiert.",
      });
    },
  });

  // Update schedule position mutation
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
      refetchSchedules();
      toast({
        title: "Zeitplan aktualisiert",
        description: "Der Zeitplan wurde erfolgreich aktualisiert.",
      });
    },
  });

  // Update todo schedule mutation
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
      refetchTodoSchedules();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({
        title: "Todo aktualisiert",
        description: "Das Todo wurde erfolgreich eingeplant.",
      });
    },
  });

  // Create habit schedule mutation
  const createHabitScheduleMutation = useMutation({
    mutationFn: async ({ habitId, time, day }: { habitId: string, time: string, day: Date }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: existingSchedule } = await supabase
        .from("habit_schedules")
        .select("id")
        .eq("user_id", user.id)
        .eq("habit_id", habitId)
        .eq("scheduled_date", format(day, "yyyy-MM-dd"))
        .eq("scheduled_time", time)
        .maybeSingle();

      if (existingSchedule) {
        toast({
          title: "Gewohnheit bereits eingeplant",
          description: "Diese Gewohnheit ist bereits für diesen Zeitpunkt eingeplant.",
          variant: "destructive"
        });
        return null;
      }

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
      refetchSchedules();
      toast({
        title: "Gewohnheit eingeplant",
        description: "Die Gewohnheit wurde erfolgreich eingeplant.",
      });
    },
  });

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

  const handleSavePreferences = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;

    savePreferencesMutation.mutate({
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`
    });
  };

  return {
    habits,
    schedules,
    todoSchedules,
    calendarPreferences,
    selectedTime,
    selectedDay,
    handleTimeSlotClick,
    handleScheduleTodo,
    handleScheduleHabit,
    handleSavePreferences,
    updateScheduleMutation,
    updateTodoScheduleMutation
  };
};
