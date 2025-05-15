import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

export const useCalendarData = (selectedDate: Date) => {
  const { user } = useUser();
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
  const { data: todos } = useQuery({
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

  todos?.forEach((todo) => {
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

  return { calendarEvents, calendarPreference };
};
