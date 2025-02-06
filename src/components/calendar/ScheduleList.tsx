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
  const { toast } = useToast();

  const handleTimeSelect = (time: string) => {
    onTimeSlotSelect(time);
    toast({
      title: "Zeitslot ausgewählt",
      description: `Zeit ${time} wurde ausgewählt.`,
    });
  };

  const handleCategorySelect = (category: string) => {
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

      <div className="space-y-4">
        {todos?.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-4 p-3 border rounded-lg"
          >
            <div className="flex-1">
              <span>{todo.title}</span>
            </div>
            <Input
              type="time"
              value={todo.scheduled_time || ""}
              onChange={(e) => handleTimeSelect(e.target.value)}
              className="w-[150px]"
            />
            <Select
              value={todo.category || ""}
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
        ))}

        {schedules?.map((schedule) => (
          <div
            key={schedule.id}
            className="flex items-center gap-4 p-3 border rounded-lg"
          >
            <span className="font-medium min-w-[60px]">
              {schedule.scheduled_time}
            </span>
            <div className="flex-1">
              <span>{schedule.habits?.name}</span>
            </div>
          </div>
        ))}

        {!schedules?.length && !todos?.length && (
          <p className="text-center text-gray-500">
            Keine Einträge für diesen Tag geplant
          </p>
        )}
      </div>
    </Card>
  );
};