
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { format, startOfWeek, addDays, getISOWeek } from "date-fns";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ViewType = 'day' | 'workweek' | 'week';

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
  const [view, setView] = useState<ViewType>('workweek');
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from(
    { length: view === 'week' ? 7 : view === 'workweek' ? 5 : 1 }, 
    (_, i) => addDays(weekStart, i)
  );

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
        .lte("date", format(addDays(weekStart, view === 'week' ? 6 : 4), "yyyy-MM-dd"));

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

  const previousPeriod = () => {
    setCurrentWeek(prev => {
      if (view === 'day') return addDays(prev, -1);
      return addDays(prev, -7);
    });
  };

  const nextPeriod = () => {
    setCurrentWeek(prev => {
      if (view === 'day') return addDays(prev, 1);
      return addDays(prev, 7);
    });
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
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="day">Tag</TabsTrigger>
              <TabsTrigger value="workweek">Mo-Fr</TabsTrigger>
              <TabsTrigger value="week">Woche</TabsTrigger>
            </TabsList>
          </Tabs>
          <span className="text-sm text-muted-foreground">
            KW {getISOWeek(weekStart)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={previousPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium text-sm md:text-base">
            {format(weekStart, view === 'day' ? "dd. MMMM yyyy" : "dd. MMMM yyyy", { locale: de })}
          </span>
          <Button variant="outline" size="icon" onClick={nextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0 mt-6">
        <div className={`min-w-[${isMobile ? '300px' : '800px'}] px-4 md:px-0`}>
          <div className={`grid ${
            view === 'day' 
              ? 'grid-cols-[120px_1fr]' 
              : `grid-cols-[120px_repeat(${weekDays.length},1fr)]`
          } gap-1 mb-2`}>
            <div className="font-medium text-sm md:text-base">Zeit</div>
            {view !== 'day' && weekDays.map(day => (
              <div key={day.toString()} className="font-medium text-center text-sm md:text-base">
                {format(day, isMobile ? "E" : "EEE", { locale: de })}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot.time}
                className={`grid ${
                  view === 'day' 
                    ? 'grid-cols-[120px_1fr]' 
                    : `grid-cols-[120px_repeat(${weekDays.length},1fr)]`
                } gap-1`}
              >
                <div className="text-xs md:text-sm py-2 px-2 bg-gray-50 rounded truncate">
                  {isMobile ? slot.time.split(" - ")[0] : slot.time}
                </div>
                {view === 'day' ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`rounded min-h-[40px] md:min-h-[48px] p-1 md:p-2 text-xs md:text-sm cursor-pointer transition-colors ${
                            getActivityForSlot(slot.time, weekStart)
                              ? getActivityForSlot(slot.time, weekStart)?.type === 'todo'
                                ? 'bg-blue-50 hover:bg-blue-100'
                                : 'bg-green-50 hover:bg-green-100'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            const activity = getActivityForSlot(slot.time, weekStart);
                            if (activity) {
                              setSelectedActivity(activity);
                            } else {
                              setSelectedSlot({ time: slot.time, date: weekStart });
                            }
                          }}
                        >
                          {getActivityForSlot(slot.time, weekStart) && (
                            <div className="flex items-center space-x-1">
                              <span className="font-medium truncate max-w-[80%]">
                                {getActivityForSlot(slot.time, weekStart)?.title}
                              </span>
                              <MoreHorizontal className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      {getActivityForSlot(slot.time, weekStart) && (
                        <TooltipContent>
                          <p className="font-medium">
                            {getActivityForSlot(slot.time, weekStart)?.title}
                          </p>
                          {getActivityForSlot(slot.time, weekStart)?.category && (
                            <p className="text-xs text-gray-500">
                              {getActivityForSlot(slot.time, weekStart)?.category}
                            </p>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  weekDays.map(day => {
                    const activity = getActivityForSlot(slot.time, day);
                    return (
                      <TooltipProvider key={day.toString()}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`rounded min-h-[40px] md:min-h-[48px] p-1 md:p-2 text-xs md:text-sm cursor-pointer transition-colors ${
                                activity 
                                  ? activity.type === 'todo' 
                                    ? 'bg-blue-50 hover:bg-blue-100'
                                    : 'bg-green-50 hover:bg-green-100'
                                  : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                              onClick={() => {
                                if (activity) {
                                  setSelectedActivity(activity);
                                } else {
                                  setSelectedSlot({ time: slot.time, date: day });
                                }
                              }}
                            >
                              {activity && (
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium truncate max-w-[80%]">
                                    {activity.title}
                                  </span>
                                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          {activity && (
                            <TooltipContent>
                              <p className="font-medium">{activity.title}</p>
                              {activity.category && (
                                <p className="text-xs text-gray-500">{activity.category}</p>
                              )}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
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

      <Dialog open={!!selectedActivity} onOpenChange={(open) => !open && setSelectedActivity(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedActivity?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedActivity?.category && (
              <p className="text-sm text-gray-500">
                Kategorie: {selectedActivity.category}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Typ: {selectedActivity?.type === 'todo' ? 'Aufgabe' : 'Gewohnheit'}
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedActivity) {
                  deleteTimeboxEntryMutation.mutate(selectedActivity.id);
                  setSelectedActivity(null);
                }
              }}
            >
              Eintrag löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
