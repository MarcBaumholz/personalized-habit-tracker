
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Check, AlertCircle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTime: string | null;
  selectedDay: Date | null;
  habits: any[];
  todos: any[];
  onScheduleHabit: (habit: any, time: string, day: Date) => void;
  onScheduleTodo: (todo: any, time: string, day: Date) => void;
  schedules?: any[];
  scheduledTodos?: any[];
}

export const ScheduleDialog: React.FC<ScheduleDialogProps> = ({
  open,
  onOpenChange,
  selectedTime,
  selectedDay,
  habits,
  todos,
  onScheduleHabit,
  onScheduleTodo,
  schedules = [],
  scheduledTodos = []
}) => {
  const { toast } = useToast();
  
  if (!selectedTime || !selectedDay) return null;

  // Filter for todos that aren't already scheduled
  const unscheduledTodos = todos.filter(todo => !todo.scheduled_time);

  // Check if the selected time slot is already occupied
  const isTimeSlotOccupied = () => {
    const selectedDateString = format(selectedDay, "yyyy-MM-dd");
    
    const hasSchedule = schedules.some(schedule => 
      format(new Date(schedule.scheduled_date), "yyyy-MM-dd") === selectedDateString &&
      schedule.scheduled_time === selectedTime
    );
    
    const hasTodo = scheduledTodos.some(todo => 
      todo.scheduled_time === selectedTime && 
      format(new Date(todo.scheduled_date || new Date()), "yyyy-MM-dd") === selectedDateString
    );
    
    return hasSchedule || hasTodo;
  };

  const handleQuickScheduleHabit = (habit: any) => {
    if (isTimeSlotOccupied()) {
      toast({
        title: "Zeitslot bereits belegt",
        description: "Dieser Zeitslot ist bereits mit einer Gewohnheit oder einem Todo belegt.",
        variant: "destructive"
      });
      return;
    }
    
    onScheduleHabit(habit, selectedTime, selectedDay);
    onOpenChange(false);
  };

  const handleQuickScheduleTodo = (todo: any) => {
    if (isTimeSlotOccupied()) {
      toast({
        title: "Zeitslot bereits belegt",
        description: "Dieser Zeitslot ist bereits mit einer Gewohnheit oder einem Todo belegt.",
        variant: "destructive"
      });
      return;
    }
    
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
        
        {isTimeSlotOccupied() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 my-2 flex items-center gap-2 text-yellow-700">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <p className="text-sm">Dieser Zeitslot ist bereits belegt. Wähle eine andere Zeit oder einen anderen Tag.</p>
          </div>
        )}
        
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
                    className={`p-3 bg-blue-50 rounded-md flex justify-between items-center ${isTimeSlotOccupied() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100 cursor-pointer'} transition-all`}
                    onClick={() => !isTimeSlotOccupied() && handleQuickScheduleHabit(habit)}
                  >
                    <div className="truncate font-medium">{habit.name}</div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 rounded-full" 
                      disabled={isTimeSlotOccupied()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickScheduleHabit(habit);
                      }}
                    >
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
                    className={`p-3 bg-green-50 rounded-md flex justify-between items-center ${isTimeSlotOccupied() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-100 cursor-pointer'} transition-all`}
                    onClick={() => !isTimeSlotOccupied() && handleQuickScheduleTodo(todo)}
                  >
                    <div className="truncate font-medium">{todo.title}</div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 rounded-full" 
                      disabled={isTimeSlotOccupied()}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickScheduleTodo(todo);
                      }}
                    >
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
