
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Define explicit types to avoid circular references
export interface HabitSchedule {
  id: string;
  habit_id: string;
  user_id: string;
  scheduled_time: string | null;
  scheduled_date: string | null;
  position_x: number | null;
  position_y: number | null;
  habits?: {
    id: string;
    name: string;
    category: string | null;
  };
}

// Update the TodoSchedule interface to match the actual data structure from Supabase
export interface TodoSchedule {
  id: string;
  title: string;
  scheduled_time: string | null;
  scheduled_date?: string | null;
  position_x?: number | null;
  position_y?: number | null;
  category?: string | null;
  completed?: boolean;
  created_at?: string;
  due_date?: string;
  priority?: number;
  user_id?: string;
}

export interface CalendarPreference {
  start_time: string;
  end_time: string;
  default_view: string;
}

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

      return (data || []) as HabitSchedule[];
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

      // Since the actual todo data structure doesn't perfectly match our TodoSchedule type,
      // we accept the data as is because it has all the required properties
      return (data || []) as TodoSchedule[];
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
    mutationFn: async (preferences: Partial<CalendarPreference>) => {
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
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<HabitSchedule> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Check if the time slot is already occupied
      if (updates.scheduled_time) {
        const { data: existingItems } = await supabase
          .from("habit_schedules")
          .select("id")
          .eq("user_id", user.id)
          .eq("scheduled_date", format(date || new Date(), "yyyy-MM-dd"))
          .eq("scheduled_time", updates.scheduled_time)
          .neq("id", id);

        if (existingItems && existingItems.length > 0) {
          throw new Error("Dieser Zeitslot ist bereits belegt.");
        }

        const { data: existingTodos } = await supabase
          .from("todos")
          .select("id")
          .eq("user_id", user.id)
          .eq("scheduled_date", format(date || new Date(), "yyyy-MM-dd"))
          .eq("scheduled_time", updates.scheduled_time);

        if (existingTodos && existingTodos.length > 0) {
          throw new Error("Dieser Zeitslot ist bereits belegt.");
        }
      }

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
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update todo schedule mutation
  const updateTodoScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<TodoSchedule> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Check if the time slot is already occupied
      if (updates.scheduled_time && updates.scheduled_date) {
        const { data: existingSchedules } = await supabase
          .from("habit_schedules")
          .select("id")
          .eq("user_id", user.id)
          .eq("scheduled_date", updates.scheduled_date)
          .eq("scheduled_time", updates.scheduled_time);

        if (existingSchedules && existingSchedules.length > 0) {
          throw new Error("Dieser Zeitslot ist bereits belegt.");
        }

        const { data: existingTodos } = await supabase
          .from("todos")
          .select("id")
          .eq("user_id", user.id)
          .eq("scheduled_date", updates.scheduled_date)
          .eq("scheduled_time", updates.scheduled_time)
          .neq("id", id);

        if (existingTodos && existingTodos.length > 0) {
          throw new Error("Dieser Zeitslot ist bereits belegt.");
        }
      }

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
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create habit schedule mutation
  const createHabitScheduleMutation = useMutation({
    mutationFn: async ({ habitId, time, day }: { habitId: string, time: string, day: Date }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Check if the time slot is already occupied by a habit schedule
      const { data: existingSchedule } = await supabase
        .from("habit_schedules")
        .select("id")
        .eq("user_id", user.id)
        .eq("scheduled_date", format(day, "yyyy-MM-dd"))
        .eq("scheduled_time", time)
        .maybeSingle();

      if (existingSchedule) {
        throw new Error("Dieser Zeitslot ist bereits mit einer Gewohnheit belegt.");
      }

      // Check if the time slot is already occupied by a todo
      const { data: existingTodo } = await supabase
        .from("todos")
        .select("id")
        .eq("user_id", user.id)
        .eq("scheduled_date", format(day, "yyyy-MM-dd"))
        .eq("scheduled_time", time)
        .maybeSingle();

      if (existingTodo) {
        throw new Error("Dieser Zeitslot ist bereits mit einem Todo belegt.");
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
    onError: (error) => {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete habit schedule mutation
  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .delete()
        .eq("id", scheduleId)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetchSchedules();
    }
  });

  // Delete todo schedule mutation (actually just removes the scheduling information)
  const deleteTodoScheduleMutation = useMutation({
    mutationFn: async (todoId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("todos")
        .update({
          scheduled_time: null,
          scheduled_date: null,
          position_x: null,
          position_y: null
        })
        .eq("id", todoId)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetchTodoSchedules();
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    }
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
    updateTodoScheduleMutation,
    deleteScheduleMutation,
    deleteTodoScheduleMutation
  };
};
