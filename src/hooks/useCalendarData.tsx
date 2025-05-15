
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/hooks/useUser";

// Define interfaces for calendar data types
export interface TimeboxEntry {
  id: string;
  date: string;
  time_slot: string;
  habit_id?: string;
  todo_id?: string;
  user_id: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  type: "habit" | "todo";
  completed?: boolean;
  category?: string;
}

// Define TodoSchedule interface explicitly without deep nesting
export interface TodoSchedule {
  id: string;
  title: string;
  completed?: boolean;
  created_at?: string;
  due_date?: string;
  priority?: number;
  user_id?: string;
  category?: string | null;
  scheduled_time: string | null;
  scheduled_date?: string | null;
  position_x?: number | null;
  position_y?: number | null;
}

export interface CalendarPreference {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  default_view: string;
  created_at: string;
}

export interface HabitScheduleUpdate {
  id: string;
  updates: {
    scheduled_time: string;
    position_x: number;
    position_y: number;
  };
}

export interface TodoScheduleUpdate {
  id: string;
  updates: {
    scheduled_time: string;
    scheduled_date: string;
    position_x: number;
    position_y: number;
  };
}

export const useCalendarData = (selectedDate: Date) => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [calendarPreference, setCalendarPreference] = useState<CalendarPreference | null>(null);

  const { data: habits } = useQuery({
    queryKey: ["habits", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user?.id);
      if (error) {
        console.error("Error fetching habits:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  // For the query that was causing the excessive type depth, use a type assertion:
  const { data: todoSchedules } = useQuery({
    queryKey: ["todos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("todos")
        .select()
        .eq("user_id", user?.id)
        .not("scheduled_time", "is", null);

      if (error) {
        console.error("Error fetching todos:", error);
        return [];
      }

      // Use type assertion to fix the excessive type depth error
      return data as unknown as TodoSchedule[];
    },
    enabled: !!user,
  });

  const { data: schedules } = useQuery({
    queryKey: ["habit_schedules", user?.id, selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_schedules")
        .select("*, habits(name, category)")
        .eq("user_id", user?.id);
      
      if (error) {
        console.error("Error fetching habit schedules:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  const { data: timeboxEntries } = useQuery({
    queryKey: ["timeboxEntries", user?.id, selectedDate],
    queryFn: async () => {
      const formattedDate = selectedDate.toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("timebox_entries")
        .select("*")
        .eq("user_id", user?.id)
        .eq("date", formattedDate);
      if (error) {
        console.error("Error fetching timebox entries:", error);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });

  useEffect(() => {
    const fetchCalendarPreference = async () => {
      if (user) {
        try {
          const { data: preference, error } = await supabase
            .from("calendar_preferences")
            .select("*")
            .eq("user_id", user.id)
            .single();

          if (error) {
            console.error("Error fetching calendar preferences:", error);
          } else {
            setCalendarPreference(preference);
          }
        } catch (error) {
          console.error("Unexpected error fetching calendar preferences:", error);
        }
      }
    };

    fetchCalendarPreference();
  }, [user]);

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: HabitScheduleUpdate) => {
      const { data, error } = await supabase
        .from("habit_schedules")
        .update(updates)
        .eq("id", id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit_schedules"] });
    },
  });

  const updateTodoScheduleMutation = useMutation({
    mutationFn: async ({ id, updates }: TodoScheduleUpdate) => {
      const { data, error } = await supabase
        .from("todos")
        .update(updates)
        .eq("id", id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data, error } = await supabase
        .from("habit_schedules")
        .delete()
        .eq("id", scheduleId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit_schedules"] });
    },
  });

  const deleteTodoScheduleMutation = useMutation({
    mutationFn: async (todoId: string) => {
      const { data, error } = await supabase
        .from("todos")
        .update({ scheduled_time: null, scheduled_date: null })
        .eq("id", todoId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleTimeSlotClick = (time: string, date: Date) => {
    console.log(`Time slot clicked: ${time} on ${date.toDateString()}`);
  };

  const handleScheduleTodo = async (todo: any, time: string, day: Date) => {
    try {
      const formattedDate = day.toISOString().split("T")[0];
      
      await supabase
        .from("todos")
        .update({ 
          scheduled_time: time,
          scheduled_date: formattedDate,
          position_x: 1,
          position_y: 1
        })
        .eq("id", todo.id);
      
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    } catch (error) {
      console.error("Error scheduling todo:", error);
    }
  };

  const handleScheduleHabit = async (habit: any, time: string, day: Date) => {
    try {
      const formattedDate = day.toISOString().split("T")[0];
      
      await supabase
        .from("habit_schedules")
        .insert({
          habit_id: habit.id,
          user_id: user?.id,
          scheduled_time: time,
          scheduled_date: formattedDate,
          position_x: 1,
          position_y: 1
        });
      
      queryClient.invalidateQueries({ queryKey: ["habit_schedules"] });
    } catch (error) {
      console.error("Error scheduling habit:", error);
    }
  };

  const handleSavePreferences = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    
    try {
      if (calendarPreference) {
        // Update existing preferences
        await supabase
          .from("calendar_preferences")
          .update({
            start_time: startTime,
            end_time: endTime,
          })
          .eq("user_id", user?.id);
      } else {
        // Create new preferences
        await supabase
          .from("calendar_preferences")
          .insert({
            user_id: user?.id,
            start_time: startTime,
            end_time: endTime,
            default_view: 'week'
          });
      }
      
      // Refresh calendar preferences
      const { data: updatedPreference } = await supabase
        .from("calendar_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .single();
        
      setCalendarPreference(updatedPreference);
    } catch (error) {
      console.error("Error saving calendar preferences:", error);
    }
  };

  const calendarEvents: CalendarEvent[] = [];

  // Map habits to calendar events
  habits?.forEach((habit) => {
    timeboxEntries?.forEach((entry) => {
      if (entry.habit_id === habit.id) {
        const [hours, minutes] = entry.time_slot.split(":").map(Number);
        const eventDate = new Date(entry.date);
        eventDate.setHours(hours, minutes, 0, 0);

        const endEventDate = new Date(eventDate);
        endEventDate.setHours(hours + 1, minutes, 0, 0);

        calendarEvents.push({
          id: entry.id,
          title: habit.name,
          start: eventDate,
          end: endEventDate,
          type: "habit",
        });
      }
    });
  });

  todoSchedules?.forEach((todo) => {
    if (todo.scheduled_time && todo.scheduled_date) {
      const [hours, minutes] = todo.scheduled_time.split(":").map(Number);
      const eventDate = new Date(todo.scheduled_date);
      eventDate.setHours(hours, minutes, 0, 0);

      const endEventDate = new Date(eventDate);
      endEventDate.setHours(hours + 1, minutes, 0, 0);

      calendarEvents.push({
        id: todo.id,
        title: todo.title,
        start: eventDate,
        end: endEventDate,
        type: "todo",
        completed: todo.completed,
        category: todo.category || undefined,
      });
    }
  });

  return { 
    calendarEvents, 
    calendarPreferences: calendarPreference, 
    habits,
    schedules,
    todoSchedules,
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
