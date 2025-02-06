
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  todos: Todo[] | undefined;
  habits: Habit[] | undefined;
  onAssignTodo: (todoId: string, time: string) => void;
  onAssignHabit: (habitId: string, time: string) => void;
}

const CATEGORIES = ["Arbeit", "Persönlich", "Gesundheit", "Einkaufen", "Sonstiges"];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => 
  `${i.toString().padStart(2, '0')}:00`
);

export const ScheduleList = ({ 
  date, 
  schedules, 
  todos,
  habits,
  onAssignTodo,
  onAssignHabit,
}: ScheduleListProps) => {
  const { toast } = useToast();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
    setIsDialogOpen(true);
  };

  const handleAssignTodo = (todoId: string) => {
    onAssignTodo(todoId, selectedTime);
    setIsDialogOpen(false);
    toast({
      title: "Aufgabe eingeplant",
      description: `Die Aufgabe wurde für ${selectedTime} Uhr eingeplant.`,
    });
  };

  const handleAssignHabit = (habitId: string) => {
    onAssignHabit(habitId, selectedTime);
    setIsDialogOpen(false);
    toast({
      title: "Gewohnheit eingeplant",
      description: `Die Gewohnheit wurde für ${selectedTime} Uhr eingeplant.`,
    });
  };

  const timeSlots = TIME_SLOTS.map(time => {
    const scheduledItems = schedules?.filter(s => s.scheduled_time === time) || [];
    const todoItems = todos?.filter(t => t.scheduled_time === time) || [];
    
    return {
      time,
      items: [...scheduledItems, ...todoItems],
    };
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Tagesplan für {date ? format(date, "dd. MMMM yyyy", { locale: de }) : ""}
        </h2>
      </div>

      <div className="space-y-2">
        {timeSlots.map(({ time, items }) => (
          <div
            key={time}
            onClick={() => handleTimeSlotClick(time)}
            className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors
              ${items.length > 0 ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
          >
            <span className="font-medium min-w-[60px]">{time}</span>
            <div className="flex-1">
              {items.map((item: any, index: number) => (
                <div key={item.id} className={index > 0 ? 'mt-1' : ''}>
                  {item.habits?.name || item.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zeitslot {selectedTime} Uhr</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="font-medium mb-2">Aufgaben</h3>
              <div className="space-y-2">
                {todos?.filter(todo => !todo.scheduled_time).map(todo => (
                  <Button
                    key={todo.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAssignTodo(todo.id)}
                  >
                    {todo.title}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Gewohnheiten</h3>
              <div className="space-y-2">
                {habits?.map(habit => (
                  <Button
                    key={habit.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAssignHabit(habit.id)}
                  >
                    {habit.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
