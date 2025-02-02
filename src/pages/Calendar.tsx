import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedHabit, setSelectedHabit] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: habits } = useQuery({
    queryKey: ["habits"],
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

  const { data: schedules } = useQuery({
    queryKey: ["habit-schedules", date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habit_schedules")
        .select("*, habits(*)")
        .eq("user_id", user.id)
        .eq("scheduled_date", format(date || new Date(), "yyyy-MM-dd"));

      return data || [];
    },
  });

  const scheduleHabitMutation = useMutation({
    mutationFn: async ({ habitId, time }: { habitId: string, time: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          scheduled_time: time,
          scheduled_date: format(date || new Date(), "yyyy-MM-dd"),
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-schedules"] });
      toast({
        title: "Gewohnheit eingeplant",
        description: "Die Gewohnheit wurde erfolgreich für diesen Tag eingeplant.",
      });
      setSelectedHabit("");
      setSelectedTime("");
    },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kalenderansicht</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Gewohnheit planen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Gewohnheit einplanen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedHabit} onValueChange={setSelectedHabit}>
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
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  placeholder="Zeit auswählen"
                />
                <Button 
                  className="w-full"
                  onClick={() => {
                    if (selectedHabit && selectedTime) {
                      scheduleHabitMutation.mutate({
                        habitId: selectedHabit,
                        time: selectedTime,
                      });
                    }
                  }}
                >
                  Einplanen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Card className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Tagesplan für {date ? format(date, "dd. MMMM yyyy", { locale: de }) : ""}
              </h2>
            </div>

            <div className="space-y-4">
              {schedules?.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <span className="font-medium min-w-[60px]">
                    {schedule.scheduled_time}
                  </span>
                  <div className="flex-1 p-2 bg-gray-50 rounded">
                    <span>{schedule.habits?.name}</span>
                  </div>
                </div>
              ))}
              {schedules?.length === 0 && (
                <p className="text-center text-gray-500">
                  Keine Gewohnheiten für diesen Tag geplant
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Calendar;