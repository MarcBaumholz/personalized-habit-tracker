
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Trash2, Plus, Clock } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HabitSchedulesProps {
  schedules: any[];
  habitId: string;
}

export const HabitSchedules = ({ schedules, habitId }: HabitSchedulesProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createHabitScheduleMutation = useMutation({
    mutationFn: async ({ date, time }: { date: string, time: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .insert({
          user_id: user.id,
          habit_id: habitId,
          scheduled_date: date,
          scheduled_time: time,
          position_x: 5,
          position_y: 5
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-schedules"] });
      toast({
        title: "Gewohnheit eingeplant",
        description: "Die Gewohnheit wurde erfolgreich zum Kalender hinzugefügt.",
      });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .delete()
        .eq("id", scheduleId)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-schedules"] });
      toast({
        title: "Planung entfernt",
        description: "Die Gewohnheitsplanung wurde erfolgreich entfernt.",
      });
    },
  });

  const handleAddToCalendar = (date: string, time: string) => {
    createHabitScheduleMutation.mutate({ date, time });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    deleteScheduleMutation.mutate(scheduleId);
  };

  const getTodayTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const roundedHours = Math.floor(hours / 1) * 1;
    return `${roundedHours < 10 ? '0' + roundedHours : roundedHours}:00`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Planungen</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Planen
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b bg-blue-50">
                <h3 className="font-medium">Wann möchtest du diese Gewohnheit planen?</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Datum</label>
                    <input 
                      type="date" 
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      defaultValue={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Uhrzeit</label>
                    <input 
                      type="time" 
                      className="w-full rounded-md border border-input px-3 py-2 text-sm"
                      defaultValue={getTodayTime()}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddToCalendar(
                      format(new Date(), "yyyy-MM-dd"),
                      "08:00"
                    )}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span>08:00</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddToCalendar(
                      format(new Date(), "yyyy-MM-dd"),
                      "12:00"
                    )}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span>12:00</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddToCalendar(
                      format(new Date(), "yyyy-MM-dd"),
                      "18:00"
                    )}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    <span>18:00</span>
                  </Button>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
                    
                    if (dateInput && timeInput) {
                      handleAddToCalendar(dateInput.value, timeInput.value);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Zum Kalender hinzufügen
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Zur Kalenderansicht
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules && schedules.length > 0 ? (
          <div className="space-y-3">
            {schedules.map((schedule: any) => (
              <div key={schedule.id} className="p-3 bg-blue-50 rounded-md">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {format(new Date(schedule.scheduled_date), "EEEE, dd.MM.yyyy", { locale: de })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {schedule.scheduled_time || "Keine Zeit festgelegt"} Uhr
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Keine Planungen vorhanden</p>
            <p className="text-sm">Plane deine Gewohnheit im Kalender</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Zur Kalenderansicht
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
