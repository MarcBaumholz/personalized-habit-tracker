import { Navigation } from "@/components/layout/Navigation";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: completions } = useQuery({
    queryKey: ["habit-completions", date],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habit_completions")
        .select("*, habits(*)")
        .eq("user_id", user.id);

      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <CalendarIcon className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">Kalender</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              modifiers={{
                completed: (date) => {
                  return completions?.some(
                    (completion) =>
                      completion.completed_date === date.toISOString().split("T")[0]
                  );
                },
              }}
              modifiersStyles={{
                completed: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "white",
                },
              }}
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Abgeschlossene Gewohnheiten
            </h2>
            {date && (
              <div className="space-y-2">
                {completions
                  ?.filter(
                    (completion) =>
                      completion.completed_date ===
                      date.toISOString().split("T")[0]
                  )
                  .map((completion) => (
                    <div
                      key={completion.id}
                      className="p-3 bg-secondary/10 rounded-lg"
                    >
                      <p className="font-medium">{completion.habits?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Abgeschlossen am{" "}
                        {new Date(completion.completed_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Calendar;