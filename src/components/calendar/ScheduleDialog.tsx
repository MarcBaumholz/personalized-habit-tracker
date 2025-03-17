
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTime: string | null;
  selectedDay: Date | null;
  habits: any[];
  todos: any[];
  onScheduleHabit: (habit: any, time: string, day: Date) => void;
  onScheduleTodo: (todo: any, time: string, day: Date) => void;
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  open,
  onOpenChange,
  selectedTime,
  selectedDay,
  habits,
  todos,
  onScheduleHabit,
  onScheduleTodo
}) => {
  if (!selectedTime || !selectedDay) return null;

  const unscheduledTodos = todos.filter(todo => !todo.scheduled_time);

  const handleQuickScheduleHabit = (habit: any) => {
    onScheduleHabit(habit, selectedTime, selectedDay);
    onOpenChange(false);
  };

  const handleQuickScheduleTodo = (todo: any) => {
    onScheduleTodo(todo, selectedTime, selectedDay);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Termin für {format(selectedDay, "dd.MM.yyyy", { locale: de })} um {selectedTime} Uhr
          </DialogTitle>
          <DialogDescription>
            Wähle eine Gewohnheit oder ein Todo, das du zu diesem Zeitpunkt planen möchtest.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="habits" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="habits">Gewohnheiten</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="habits" className="max-h-[300px] overflow-y-auto">
            {habits && habits.length > 0 ? (
              <div className="space-y-2">
                {habits.map((habit) => (
                  <div 
                    key={habit.id}
                    className="p-3 bg-blue-50 rounded-md flex justify-between items-center hover:bg-blue-100 cursor-pointer transition-all"
                    onClick={() => handleQuickScheduleHabit(habit)}
                  >
                    <div className="truncate font-medium">{habit.name}</div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={(e) => {
                      e.stopPropagation();
                      handleQuickScheduleHabit(habit);
                    }}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>Keine Gewohnheiten verfügbar</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="todos" className="max-h-[300px] overflow-y-auto">
            {unscheduledTodos.length > 0 ? (
              <div className="space-y-2">
                {unscheduledTodos.map((todo) => (
                  <div 
                    key={todo.id}
                    className="p-3 bg-green-50 rounded-md flex justify-between items-center hover:bg-green-100 cursor-pointer transition-all"
                    onClick={() => handleQuickScheduleTodo(todo)}
                  >
                    <div className="truncate font-medium">{todo.title}</div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={(e) => {
                      e.stopPropagation();
                      handleQuickScheduleTodo(todo);
                    }}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>Keine offenen Todos verfügbar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
