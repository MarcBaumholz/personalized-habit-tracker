
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeSlot {
  time: string;
  activities: {
    [key: string]: {
      id: string;
      title: string;
      category?: string;
      type: 'todo' | 'habit';
    };
  };
}

const TIME_SLOTS: TimeSlot[] = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  return {
    time: `${hour.toString().padStart(2, "0")}:00 - ${(hour + 1).toString().padStart(2, "0")}:00`,
    activities: {}
  };
});

export const WeeklyTimeboxing = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; date: Date } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));

  const { data: timeboxEntries } = useQuery({
    queryKey: ["timebox-entries", weekStart],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("timebox_entries")
        .select(`
          id,
          date,
          time_slot,
          todos (id, title, category),
          habits (id, name, category)
        `)
        .eq("user_id", user.id)
        .gte("date", format(weekStart, "yyyy-MM-dd"))
        .lte("date", format(addDays(weekStart, 4), "yyyy-MM-dd"));

      return data || [];
    },
  });

  const { data: todos } = useQuery({
    queryKey: ["todos-weekly"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .is("completed", false);

      return data || [];
    },
  });

  const { data: habits } = useQuery({
    queryKey: ["habits-weekly"],
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

  const addTimeboxEntryMutation = useMutation({
    mutationFn: async ({ 
      date, 
      timeSlot, 
      todoId, 
      habitId 
    }: { 
      date: Date; 
      timeSlot: string; 
      todoId?: string; 
      habitId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("timebox_entries")
        .insert({
          user_id: user.id,
          date: format(date, "yyyy-MM-dd"),
          time_slot: timeSlot,
          todo_id: todoId,
          habit_id: habitId,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timebox-entries"] });
      setSelectedSlot(null);
      toast({
        title: "Zeitslot geplant",
        description: "Der Eintrag wurde erfolgreich eingeplant.",
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Zeitslot konnte nicht geplant werden.",
        variant: "destructive",
      });
    },
  });

  const deleteTimeboxEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from("timebox_entries")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timebox-entries"] });
      toast({
        title: "Eintrag gelöscht",
        description: "Der Eintrag wurde erfolgreich gelöscht.",
      });
    },
  });

  const previousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const getActivityForSlot = (time: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const entry = timeboxEntries?.find(
      entry => entry.time_slot === time && format(new Date(entry.date), "yyyy-MM-dd") === dateStr
    );

    if (!entry) return null;

    if (entry.todos) {
      return {
        id: entry.id,
        title: entry.todos.title,
        category: entry.todos.category,
        type: 'todo' as const,
      };
    }

    if (entry.habits) {
      return {
        id: entry.id,
        title: entry.habits.name,
        category: entry.habits.category,
        type: 'habit' as const,
      };
    }

    return null;
  };

  return (
    <Card className="p-4 md:p-6 mt-6">
      <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'justify-between'} items-center mb-6`}>
        <h2 className="text-xl font-semibold">Wochenplan</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={previousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm md:text-base">
            {format(weekStart, "dd. MMMM yyyy", { locale: de })}
          </span>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className={`min-w-[${isMobile ? '600px' : '800px'}] px-4 md:px-0`}>
          <div className="grid grid-cols-[80px_repeat(5,1fr)] md:grid-cols-[120px_repeat(5,1fr)] gap-1 mb-2">
            <div className="font-medium text-sm md:text-base">Zeit</div>
            {weekDays.map(day => (
              <div key={day.toString()} className="font-medium text-center text-sm md:text-base">
                {format(day, isMobile ? "E" : "EEE", { locale: de })}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot.time}
                className="grid grid-cols-[80px_repeat(5,1fr)] md:grid-cols-[120px_repeat(5,1fr)] gap-1"
              >
                <div className="text-xs md:text-sm py-2 px-2 bg-gray-50 rounded truncate">
                  {isMobile ? slot.time.split(" - ")[0] : slot.time}
                </div>
                {weekDays.map(day => {
                  const activity = getActivityForSlot(slot.time, day);
                  
                  return (
                    <div
                      key={day.toString()}
                      className={`rounded min-h-[32px] md:min-h-[40px] p-1 md:p-2 text-xs md:text-sm cursor-pointer transition-colors ${
                        activity 
                          ? activity.type === 'todo' 
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'bg-green-50 hover:bg-green-100'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => {
                        if (activity) {
                          deleteTimeboxEntryMutation.mutate(activity.id);
                        } else {
                          setSelectedSlot({ time: slot.time, date: day });
                        }
                      }}
                    >
                      {activity && (
                        <div className="truncate">
                          <span className="font-medium">{activity.title}</span>
                          {activity.category && !isMobile && (
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

      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eintrag für {selectedSlot?.time} am{" "}
              {selectedSlot?.date && format(selectedSlot.date, "dd.MM.yyyy", { locale: de })}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="todos">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="habits">Gewohnheiten</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos" className="space-y-2">
              {todos?.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => {
                    if (selectedSlot) {
                      addTimeboxEntryMutation.mutate({
                        date: selectedSlot.date,
                        timeSlot: selectedSlot.time,
                        todoId: todo.id,
                      });
                    }
                  }}
                  className="p-2 rounded cursor-pointer hover:bg-gray-100"
                >
                  <span className="font-medium">{todo.title}</span>
                  {todo.category && (
                    <span className="ml-2 text-xs text-gray-500">
                      {todo.category}
                    </span>
                  )}
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="habits" className="space-y-2">
              {habits?.map((habit) => (
                <div
                  key={habit.id}
                  onClick={() => {
                    if (selectedSlot) {
                      addTimeboxEntryMutation.mutate({
                        date: selectedSlot.date,
                        timeSlot: selectedSlot.time,
                        habitId: habit.id,
                      });
                    }
                  }}
                  className="p-2 rounded cursor-pointer hover:bg-gray-100"
                >
                  <span className="font-medium">{habit.name}</span>
                  {habit.category && (
                    <span className="ml-2 text-xs text-gray-500">
                      {habit.category}
                    </span>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
