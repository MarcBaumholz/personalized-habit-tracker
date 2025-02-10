
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfYear, eachDayOfInterval, endOfYear } from "date-fns";
import { de } from "date-fns/locale";
import { Check, Star } from "lucide-react";

const COMPLETION_COLORS = {
  "check": "#22C55E",  // Green for full completion
  "star": "#EAB308",   // Yellow for partial completion
  "default": "#1F2937" // Dark gray for no completion
};

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
      const start = startOfYear(new Date());
      const end = endOfYear(new Date());
      const allDays = eachDayOfInterval({ start, end });

      return habits.map(habit => {
        const completionMap = new Map();
        habit.habit_completions?.forEach((completion: any) => {
          completionMap.set(completion.completed_date, completion.completion_type || 'check');
        });

        const days = allDays.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return {
            date: dateStr,
            completionType: completionMap.get(dateStr) || null,
            month: format(date, 'MMM', { locale: de }),
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

  const getCompletionColor = (completionType: string | null) => {
    if (!completionType) return COMPLETION_COLORS.default;
    return COMPLETION_COLORS[completionType as keyof typeof COMPLETION_COLORS] || COMPLETION_COLORS.default;
  };

  if (!habitsData) return null;

  return (
    <div className="space-y-4">
      {habitsData.map((habit) => (
        <Card key={habit.id} className="p-4 bg-gray-950">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">{habit.name}</h3>
            </div>
            {habit.days[habit.days.length - 1]?.completionType && (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: getCompletionColor(habit.days[habit.days.length - 1]?.completionType) }}>
                {habit.days[habit.days.length - 1]?.completionType === 'star' ? (
                  <Star className="w-5 h-5 text-black" style={{ strokeWidth: 3 }} />
                ) : (
                  <Check className="w-5 h-5 text-black" style={{ strokeWidth: 3 }} />
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-[repeat(52,1fr)] gap-1">
            {habit.days.map((day, index) => (
              <div
                key={`${habit.id}-${day.date}`}
                className="aspect-square rounded-sm transition-colors duration-200"
                style={{ backgroundColor: getCompletionColor(day.completionType) }}
                title={`${day.date}: ${day.completionType ? 'Completed' : 'Not completed'}`}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
