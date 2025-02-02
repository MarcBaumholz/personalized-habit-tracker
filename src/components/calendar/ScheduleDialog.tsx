import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface Habit {
  id: string;
  name: string;
}

interface ScheduleDialogProps {
  habits: Habit[] | undefined;
  selectedHabit: string;
  selectedTime: string;
  onHabitChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onSchedule: () => void;
}

export const ScheduleDialog = ({
  habits,
  selectedHabit,
  selectedTime,
  onHabitChange,
  onTimeChange,
  onSchedule,
}: ScheduleDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Gewohnheit planen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gewohnheit einplanen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Select
              value={selectedHabit}
              onValueChange={onHabitChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Gewohnheit auswählen" />
              </SelectTrigger>
              <SelectContent>
                {habits?.map((habit) => (
                  <SelectItem key={habit.id} value={habit.id}>
                    {habit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => onTimeChange(e.target.value)}
            />
          </div>
          <Button
            onClick={onSchedule}
            disabled={!selectedHabit || !selectedTime}
          >
            Einplanen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};