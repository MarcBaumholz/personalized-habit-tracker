
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfYear, eachDayOfInterval, endOfYear, getDay, subYears, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Check, Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const COMPLETION_COLORS = {
  "check": {
    0: "#1e293b", // No completions
    1: "#166534", // Light green
    2: "#16a34a", // Medium green
    3: "#22c55e", // Strong green
    4: "#4ade80", // Very strong green
  },
  "star": {
    0: "#1e293b", // No completions
    1: "#854d0e", // Light yellow
    2: "#ca8a04", // Medium yellow
    3: "#eab308", // Strong yellow
    4: "#facc15", // Very strong yellow
  }
};

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export const YearlyActivity = () => {
  const { data: habitsData } = useQuery({
    queryKey: ["habits-activity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habits } = await supabase
        .from("habits")
        .select(`
          *,
          habit_completions(
            completed_date,
            completion_type
          )
        `)
        .eq("user_id", user.id);

      if (!habits) return [];

      // Generate the full year of data for each habit
      const end = new Date();
      const start = subYears(end, 1);
      const allDays = eachDayOfInterval({ start, end });

      return habits.map(habit => {
        const completionMap = new Map();
        habit.habit_completions?.forEach((completion: any) => {
          const key = completion.completed_date;
          const current = completionMap.get(key) || { check: 0, star: 0 };
          
          if (completion.completion_type === 'star') {
            current.star += 1;
          } else {
            current.check += 1;
          }
          
          completionMap.set(key, current);
        });

        const days = allDays.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const completions = completionMap.get(dateStr) || { check: 0, star: 0 };
          
          // Determine color based on completion counts
          let colorType = 'check';
          let intensity = 0;
          
          if (completions.check > 0) {
            colorType = 'check';
            intensity = Math.min(Math.ceil(completions.check / 2), 4);
          } else if (completions.star > 0) {
            colorType = 'star';
            intensity = Math.min(Math.ceil(completions.star / 2), 4);
          }

          return {
            date: dateStr,
            completions,
            colorType,
            intensity,
            weekday: getDay(date),
          };
        });

        return {
          id: habit.id,
          name: habit.name,
          days
        };
      });
    }
  });

  const getCompletionColor = (colorType: string, intensity: number) => {
    return COMPLETION_COLORS[colorType as keyof typeof COMPLETION_COLORS][intensity as keyof typeof COMPLETION_COLORS["check"]];
  };

  if (!habitsData) return null;

  return (
    <div className="space-y-6">
      {habitsData.map((habit) => (
        <Card key={habit.id} className="p-6 bg-gray-950">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">{habit.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COMPLETION_COLORS.check[4] }} />
                <span className="text-xs text-gray-400">Vollständig</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COMPLETION_COLORS.star[4] }} />
                <span className="text-xs text-gray-400">Teilweise</span>
              </div>
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="min-w-max">
              <div className="flex mb-2">
                <div className="w-8" /> {/* Spacer for weekday labels */}
                <div className="flex gap-1">
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = addDays(subYears(new Date(), 1), i * 30);
                    return (
                      <div key={i} className="w-10 text-center">
                        <span className="text-xs text-gray-400">
                          {format(date, 'MMM', { locale: de })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-1">
                <div className="w-8 flex flex-col justify-around">
                  {WEEKDAYS.map((day) => (
                    <span key={day} className="text-xs text-gray-400 h-3">
                      {day}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-[repeat(52,1fr)] gap-1">
                  {habit.days.map((day, index) => (
                    <div
                      key={`${habit.id}-${day.date}`}
                      className="w-3 h-3 rounded-sm transition-colors duration-200"
                      style={{
                        backgroundColor: getCompletionColor(day.colorType, day.intensity),
                        gridRow: day.weekday + 1
                      }}
                      title={`${day.date}: ${
                        day.completions.check ? `${day.completions.check} vollständig` : 
                        day.completions.star ? `${day.completions.star} teilweise` : 
                        'Keine Einträge'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="mt-4 flex justify-end gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              Weniger
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: COMPLETION_COLORS.check[level] }}
                />
              ))}
              Mehr
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
