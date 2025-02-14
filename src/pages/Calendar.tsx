
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
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";

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

  const { data: calendarPreferences } = useQuery({
    queryKey: ["calendar-preferences"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("calendar_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return data;
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Extrahiere Zeit und Position aus der Drop-Zone ID
    const [time, position] = over.id.toString().split('-');
    
    updateScheduleMutation.mutate({
      id: active.id,
      updates: {
        scheduled_time: time,
        position_x: parseInt(position.split(':')[0]),
        position_y: parseInt(position.split(':')[1])
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Navigation />
      <DndContext onDragEnd={handleDragEnd}>
        <main className="container py-8 px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <Card className="p-6">
              <WeeklyTimeboxing
                date={date}
                schedules={schedules}
                preferences={calendarPreferences}
              />
            </Card>
            
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
                  habits={habits}
                  isDraggable
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
