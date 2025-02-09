
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, MoreHorizontal } from "lucide-react";
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

type ViewType = 'day' | 'workweek';

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
    { length: view === 'workweek' ? 5 : 1 }, 
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
        .lte("date", format(addDays(weekStart, view === 'workweek' ? 4 : 0), "yyyy-MM-dd"));

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
    <Card className="p-6 md:p-8 mt-8 bg-white/90 backdrop-blur-sm shadow-xl rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-800 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
              {format(weekStart, "MMMM yyyy", { locale: de })}
            </h2>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)} className="w-full sm:w-auto">
            <TabsList className="bg-blue-50/50 border border-blue-100">
              <TabsTrigger value="day" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Tag
              </TabsTrigger>
              <TabsTrigger value="workweek" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Mo-Fr
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={previousPeriod} className="hover:bg-blue-50 border-blue-200">
            <ChevronLeft className="h-4 w-4 text-blue-600" />
          </Button>
          <span className="font-medium text-sm md:text-base text-blue-800">
            KW {getISOWeek(weekStart)}
          </span>
          <Button variant="outline" size="icon" onClick={nextPeriod} className="hover:bg-blue-50 border-blue-200">
            <ChevronRight className="h-4 w-4 text-blue-600" />
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl overflow-hidden border border-blue-100 bg-white">
        <div className="grid grid-cols-[80px_repeat(auto-fit,minmax(0,1fr))] bg-blue-50/80">
          <div className="p-3 font-medium text-sm text-blue-700 border-r border-blue-100">Zeit</div>
          {view !== 'day' && weekDays.map(day => (
            <div key={day.toString()} className="p-3 flex flex-col items-center border-r border-blue-100 last:border-r-0">
              <span className="font-medium text-sm text-blue-700">
                {format(day, isMobile ? "E" : "EEEE", { locale: de })}
              </span>
              <span className="text-sm text-blue-600 mt-1">
                {format(day, "dd.MM.", { locale: de })}
              </span>
            </div>
          ))}
        </div>

        <div className="divide-y divide-blue-100">
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.time}
              className="grid grid-cols-[80px_repeat(auto-fit,minmax(0,1fr))]"
            >
              <div className="p-2 text-xs text-blue-600 bg-blue-50/50 border-r border-blue-100">
                {isMobile ? slot.time.split(" - ")[0] : slot.time}
              </div>
              {view === 'day' ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`min-h-[60px] p-2 cursor-pointer transition-all hover:bg-blue-50 border-l border-blue-100 group ${
                          getActivityForSlot(slot.time, weekStart)
                            ? getActivityForSlot(slot.time, weekStart)?.type === 'todo'
                              ? 'bg-blue-50/80'
                              : 'bg-green-50/80'
                            : 'bg-white'
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
                          <div className="flex items-center justify-between space-x-2">
                            <span className="font-medium text-sm truncate">
                              {getActivityForSlot(slot.time, weekStart)?.title}
                            </span>
                            <MoreHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                            className={`min-h-[60px] p-2 cursor-pointer transition-all hover:bg-purple-50 border-l border-purple-100 group ${
                              activity 
                                ? activity.type === 'todo' 
                                  ? 'bg-blue-50/80'
                                  : 'bg-green-50/80'
                                : 'bg-white'
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
                              <div className="flex items-center justify-between space-x-2">
                                <span className="font-medium text-sm truncate">
                                  {activity.title}
                                </span>
                                <MoreHorizontal className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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

