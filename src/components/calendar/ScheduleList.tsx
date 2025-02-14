
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDraggable } from "@dnd-kit/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

export const ScheduleList = ({
  date,
  schedules,
  todos,
  habits,
  isDraggable = false
}: ScheduleListProps) => {
  const { toast } = useToast();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  // Fetch daily todos
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
        .limit(5);

      return data || [];
    },
  });

  const handleTimeSelect = (todo: Todo) => {
    setSelectedTodo(todo);
    setSelectedTime("");
    setIsDialogOpen(true);
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Tagesplan für {date ? format(date, "dd. MMMM yyyy", { locale: de }) : ""}
        </h2>
      </div>

      <div className="space-y-2">
        {dailyTodos?.map((todo) => {
          const draggable = isDraggable ? useDraggable({
            id: todo.id,
            data: { type: 'todo', ...todo }
          }) : null;

          return (
            <div
              key={todo.id}
              ref={draggable?.setNodeRef}
              {...draggable?.listeners}
              {...draggable?.attributes}
              className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors
                ${todo.scheduled_time ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
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
          );
        })}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zeit auswählen</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-2 p-4">
            {Array.from({ length: 24 }, (_, i) => (
              <Button
                key={i}
                variant="outline"
                onClick={() => setSelectedTime(`${i.toString().padStart(2, '0')}:00`)}
                className={selectedTime === `${i.toString().padStart(2, '0')}:00` ? 'bg-primary text-primary-foreground' : ''}
              >
                {i.toString().padStart(2, '0')}:00
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
