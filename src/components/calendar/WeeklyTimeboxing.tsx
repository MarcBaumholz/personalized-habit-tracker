import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TimeSlot {
  time: string;
  activities: {
    [key: string]: {
      title: string;
      category?: string;
    };
  };
}

const TIME_SLOTS: TimeSlot[] = Array.from({ length: 36 }, (_, i) => {
  const hour = Math.floor(i / 2) + 5;
  const minute = i % 2 === 0 ? "00" : "30";
  const nextHour = minute === "30" ? hour + 1 : hour;
  const nextMinute = minute === "30" ? "00" : "30";
  
  return {
    time: `${hour.toString().padStart(2, "0")}:${minute} - ${nextHour.toString().padStart(2, "0")}:${nextMinute}`,
    activities: {}
  };
});

export const WeeklyTimeboxing = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const { data: todos } = useQuery({
    queryKey: ["todos-weekly"],
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

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, scheduledTime }: { id: string; scheduledTime: string | null }) => {
      const { error } = await supabase
        .from("todos")
        .update({ scheduled_time: scheduledTime })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos-weekly"] });
      toast({
        title: "Zeitplan aktualisiert",
        description: "Der Zeitplan wurde erfolgreich aktualisiert.",
      });
    },
  });

  const previousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  // Populate time slots with todos
  const populatedTimeSlots = TIME_SLOTS.map(slot => {
    const slotActivities = { ...slot.activities };
    
    todos?.forEach(todo => {
      if (todo.scheduled_time) {
        const todoTime = todo.scheduled_time.split(":")[0] + ":" + todo.scheduled_time.split(":")[1];
        if (slot.time.startsWith(todoTime)) {
          const todoDate = format(parseISO(todo.due_date), "yyyy-MM-dd");
          slotActivities[todoDate] = {
            title: todo.title,
            category: todo.category,
          };
        }
      }
    });

    return {
      ...slot,
      activities: slotActivities,
    };
  });

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Wochenplan</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(weekStart, "dd. MMMM yyyy", { locale: de })}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-1 mb-2">
            <div className="font-medium">Zeit</div>
            {weekDays.map(day => (
              <div key={day.toString()} className="font-medium text-center">
                {format(day, "EEE", { locale: de })}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {populatedTimeSlots.map((slot) => (
              <div
                key={slot.time}
                className="grid grid-cols-[120px_repeat(5,1fr)] gap-1"
              >
                <div className="text-sm py-2 px-2 bg-gray-50 rounded">
                  {slot.time}
                </div>
                {weekDays.map(day => {
                  const dateKey = format(day, "yyyy-MM-dd");
                  const activity = slot.activities[dateKey];
                  
                  return (
                    <div
                      key={day.toString()}
                      className={`rounded min-h-[40px] p-2 text-sm cursor-pointer transition-colors ${
                        activity ? 'bg-blue-50 hover:bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {activity && (
                        <div>
                          <span className="font-medium">{activity.title}</span>
                          {activity.category && (
                            <span className="ml-2 text-xs text-gray-500">
                              {activity.category}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};