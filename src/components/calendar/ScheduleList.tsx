
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DraggableScheduleItem } from "./DraggableScheduleItem";
import { Plus, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Schedule {
  id: string;
  scheduled_time: string;
  habits: {
    name: string;
  };
}

interface Todo {
  id: string;
  title: string;
  category: string;
  scheduled_time: string;
}

interface Habit {
  id: string;
  name: string;
  category: string;
}

interface ScheduleListProps {
  date: Date | undefined;
  schedules: Schedule[] | undefined;
  todos?: Todo[] | undefined;
  habits: Habit[] | undefined;
  isDraggable?: boolean;
  onScheduleTodo?: (todo: Todo, time: string) => void;
  onScheduleHabit?: (habit: Habit, time: string) => void;
}

export const ScheduleList = ({
  date,
  schedules,
  todos,
  habits,
  isDraggable = false,
  onScheduleTodo,
  onScheduleHabit
}: ScheduleListProps) => {
  const { toast } = useToast();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("todos");

  const { data: dailyTodos } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: true })
        .limit(10);

      return data || [];
    },
  });

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsDialogOpen(true);
  };

  const handleQuickSchedule = (item: Todo | Habit, type: "todo" | "habit") => {
    if (type === "todo" && onScheduleTodo) {
      onScheduleTodo(item as Todo, "09:00");
      toast({
        title: "Todo eingeplant",
        description: `${(item as Todo).title} wurde für 9:00 Uhr eingeplant`,
      });
    } else if (type === "habit" && onScheduleHabit) {
      onScheduleHabit(item as Habit, "09:00");
      toast({
        title: "Gewohnheit eingeplant",
        description: `${(item as Habit).name} wurde für 9:00 Uhr eingeplant`,
      });
    }
  };

  const handleScheduleSelected = () => {
    if (selectedTime) {
      if (activeTab === "todos" && selectedTodo && onScheduleTodo) {
        onScheduleTodo(selectedTodo, selectedTime);
        setIsDialogOpen(false);
        setSelectedTodo(null);
        setSelectedTime("");
        toast({
          title: "Todo eingeplant",
          description: `${selectedTodo.title} wurde für ${selectedTime} Uhr eingeplant`,
        });
      } else if (activeTab === "habits" && selectedHabit && onScheduleHabit) {
        onScheduleHabit(selectedHabit, selectedTime);
        setIsDialogOpen(false);
        setSelectedHabit(null);
        setSelectedTime("");
        toast({
          title: "Gewohnheit eingeplant",
          description: `${selectedHabit.name} wurde für ${selectedTime} Uhr eingeplant`,
        });
      }
    }
  };

  // Combine todos from props and fetched todos, removing duplicates
  const allTodos = [...(todos || []), ...(dailyTodos || [])].filter((todo, index, self) => 
    index === self.findIndex((t) => t.id === todo.id)
  );

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">
          {date ? format(date, "dd. MMMM yyyy", { locale: de }) : "Tagesplan"}
        </h2>
      </div>

      <Tabs defaultValue="todos" className="mt-2">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="todos" onClick={() => setActiveTab("todos")}>Todos</TabsTrigger>
          <TabsTrigger value="habits" onClick={() => setActiveTab("habits")}>Gewohnheiten</TabsTrigger>
        </TabsList>
        <TabsContent value="todos" className="mt-2">
          <div className="text-sm text-muted-foreground mb-2">
            Ziehen Sie Todos in den Kalender oder klicken Sie doppelt zum schnellen Einplanen
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {allTodos?.length > 0 ? (
              allTodos.map((todo) => (
                isDraggable ? (
                  <DraggableScheduleItem 
                    key={todo.id} 
                    todo={todo} 
                    onDoubleClick={() => handleQuickSchedule(todo, "todo")}
                  />
                ) : (
                  <div
                    key={todo.id}
                    className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors
                      ${todo.scheduled_time ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                    onClick={() => {
                      setSelectedTodo(todo);
                      setSelectedHabit(null);
                      handleTimeSelect("09:00");
                    }}
                  >
                    <span className="font-medium min-w-[60px]">
                      {todo.scheduled_time || "---"}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{todo.title}</span>
                        {todo.category && (
                          <span className="text-sm text-gray-500">{todo.category}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Keine Todos für heute
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="habits" className="mt-2">
          <div className="text-sm text-muted-foreground mb-2">
            Ziehen Sie Gewohnheiten in den Kalender oder klicken Sie doppelt zum schnellen Einplanen
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {habits?.length > 0 ? (
              habits.map((habit) => (
                isDraggable ? (
                  <DraggableScheduleItem 
                    key={`habit-${habit.id}`} 
                    todo={{
                      id: habit.id,
                      title: habit.name,
                      category: habit.category || "Gewohnheit",
                      scheduled_time: ""
                    }}
                    isHabit
                    onDoubleClick={() => handleQuickSchedule(habit, "habit")}
                  />
                ) : (
                  <div
                    key={`habit-${habit.id}`}
                    className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setSelectedTodo(null);
                      setSelectedHabit(habit);
                      handleTimeSelect("09:00");
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span>{habit.name}</span>
                        <span className="text-sm text-gray-500">Gewohnheit</span>
                      </div>
                    </div>
                  </div>
                )
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Keine Gewohnheiten verfügbar
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Scheduled items section */}
      {schedules && schedules.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Geplante Gewohnheiten</h3>
          <div className="space-y-2">
            {schedules.map((schedule) => (
              isDraggable ? (
                <DraggableScheduleItem 
                  key={`schedule-${schedule.id}`} 
                  todo={{
                    id: schedule.id,
                    title: schedule.habits.name,
                    scheduled_time: schedule.scheduled_time,
                    category: "Gewohnheit"
                  }} 
                  isHabit
                />
              ) : (
                <div
                  key={`schedule-${schedule.id}`}
                  className="flex items-center gap-4 p-3 border rounded-lg bg-blue-50"
                >
                  <span className="font-medium min-w-[60px]">
                    {schedule.scheduled_time}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{schedule.habits.name}</span>
                      <span className="text-sm text-gray-500">Gewohnheit</span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Zeit auswählen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-medium">
                {activeTab === "todos" ? selectedTodo?.title : selectedHabit?.name}
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => (
                <Button
                  key={hour}
                  variant="outline"
                  onClick={() => setSelectedTime(`${hour.toString().padStart(2, '0')}:00`)}
                  className={selectedTime === `${hour.toString().padStart(2, '0')}:00` ? 'bg-primary text-primary-foreground' : ''}
                >
                  {hour.toString().padStart(2, '0')}:00
                </Button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline">Abbrechen</Button>
              </DialogClose>
              <Button onClick={handleScheduleSelected} disabled={!selectedTime}>
                Einplanen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
