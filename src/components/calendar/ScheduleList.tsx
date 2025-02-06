import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface ScheduleListProps {
  date: Date | undefined;
  schedules: Schedule[] | undefined;
  todos: Todo[] | undefined;
  onTimeSlotSelect: (time: string) => void;
  onCategorySelect: (category: string) => void;
}

const CATEGORIES = ["Arbeit", "Persönlich", "Gesundheit", "Einkaufen", "Sonstiges"];

export const ScheduleList = ({ 
  date, 
  schedules, 
  todos,
  onTimeSlotSelect,
  onCategorySelect
}: ScheduleListProps) => {
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();

  const sortedSchedules = schedules?.sort((a, b) => 
    (a.scheduled_time || "").localeCompare(b.scheduled_time || "")
  );

  const sortedTodos = todos?.sort((a, b) =>
    (a.scheduled_time || "").localeCompare(b.scheduled_time || "")
  );

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeSlotSelect(time);
    toast({
      title: "Zeitslot ausgewählt",
      description: `Zeit ${time} wurde ausgewählt.`,
    });
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
    toast({
      title: "Kategorie ausgewählt",
      description: `Kategorie ${category} wurde ausgewählt.`,
    });
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Tagesplan für {date ? format(date, "dd. MMMM yyyy", { locale: de }) : ""}
        </h2>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          type="time"
          value={selectedTime}
          onChange={(e) => handleTimeSelect(e.target.value)}
          className="w-[150px]"
        />
        <Select
          value={selectedCategory}
          onValueChange={handleCategorySelect}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {sortedSchedules?.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50 cursor-move"
            draggable
          >
            <span className="font-medium min-w-[60px]">
              {schedule.scheduled_time}
            </span>
            <div className="flex-1 p-2 rounded">
              <span>{schedule.habits?.name}</span>
            </div>
          </div>
        ))}

        {sortedTodos?.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-4 p-3 border rounded-lg bg-blue-50 cursor-move"
            draggable
          >
            <span className="font-medium min-w-[60px]">
              {todo.scheduled_time}
            </span>
            <div className="flex-1">
              <span>{todo.title}</span>
              {todo.category && (
                <span className="ml-2 text-sm text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                  {todo.category}
                </span>
              )}
            </div>
          </div>
        ))}

        {!sortedSchedules?.length && !sortedTodos?.length && (
          <p className="text-center text-gray-500">
            Keine Einträge für diesen Tag geplant
          </p>
        )}
      </div>
    </Card>
  );
};