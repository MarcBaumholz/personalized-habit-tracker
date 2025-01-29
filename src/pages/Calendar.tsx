import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: completions } = useQuery({
    queryKey: ["habit-completions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", user.id);

      return data || [];
    },
  });

  const isDateCompleted = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return completions?.some(c => c.completed_date === dateStr);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kalenderansicht</h1>
          <div className="space-x-2">
            <Button variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Google Kalender
            </Button>
            <Button variant="outline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Apple Kalender
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <Card className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                completed: (date) => isDateCompleted(date),
              }}
              modifiersStyles={{
                completed: {
                  color: "red",
                  position: "relative",
                },
              }}
              components={{
                DayContent: ({ date }) => (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {date.getDate()}
                    {isDateCompleted(date) && (
                      <X className="absolute text-red-500 h-full w-full opacity-50" />
                    )}
                  </div>
                ),
              }}
            />
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Tagesplan für {date ? format(date, "dd. MMMM yyyy", { locale: de }) : ""}
              </h2>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Gewohnheit planen
              </Button>
            </div>

            <div className="space-y-4">
              {["07:00", "08:30", "12:00", "15:00", "19:00"].map((time) => (
                <div key={time} className="flex items-center gap-4 p-3 border rounded-lg">
                  <span className="font-medium min-w-[60px]">{time}</span>
                  <div className="flex-1 p-2 bg-secondary/20 rounded">
                    <span className="text-sm text-muted-foreground">
                      Plane deine Gewohnheit...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Calendar;