
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfYear, eachDayOfInterval, endOfYear } from "date-fns";
import { de } from "date-fns/locale";
import { Check } from "lucide-react";

const LIFE_AREA_COLORS = {
  "Gesundheit": "#22C55E",      // Green for health
  "Beziehungen": "#EC4899",     // Pink for relationships
  "Karriere": "#3B82F6",        // Blue for career
  "Finanzen": "#8B5CF6",        // Purple for finances
  "Persönlichkeit": "#F97316",  // Orange for personal development
  "Freizeit": "#EAB308",        // Yellow for leisure
  "Spiritualität": "#14B8A6",   // Teal for spirituality
  "Umwelt": "#64748B",         // Slate for environment
};

export const YearlyActivity = () => {
  const { data: habitsData } = useQuery({
    queryKey: ["habits-activity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habits } = await supabase
        .from("habits")
        .select("*, habit_completions(completed_date), life_area")
        .eq("user_id", user.id);

      if (!habits) return [];

      // Generate the full year of data for each habit
      const start = startOfYear(new Date());
      const end = endOfYear(new Date());
      const allDays = eachDayOfInterval({ start, end });

      return habits.map(habit => {
        const completionMap = new Map();
        habit.habit_completions?.forEach((completion: any) => {
          completionMap.set(completion.completed_date, true);
        });

        const days = allDays.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return {
            date: dateStr,
            completed: completionMap.has(dateStr),
            month: format(date, 'MMM', { locale: de }),
          };
        });

        return {
          id: habit.id,
          name: habit.name,
          lifeArea: habit.life_area || 'Persönlichkeit',
          days
        };
      });
    }
  });

  const getActivityStyle = (completed: boolean, lifeArea: string) => {
    if (!completed) return 'bg-gray-800 dark:bg-gray-900';
    const baseColor = LIFE_AREA_COLORS[lifeArea as keyof typeof LIFE_AREA_COLORS] || '#64748B';
    
    return `bg-[${baseColor}]`;
  };

  if (!habitsData) return null;

  return (
    <div className="space-y-4">
      {habitsData.map((habit) => (
        <Card key={habit.id} className="p-4 bg-gray-950">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: LIFE_AREA_COLORS[habit.lifeArea as keyof typeof LIFE_AREA_COLORS] || '#64748B' }}>
                <span className="text-white text-sm">{habit.name.charAt(0)}</span>
              </div>
              <h3 className="text-lg font-medium text-white">{habit.name}</h3>
            </div>
            {habit.days[habit.days.length - 1]?.completed && (
              <div className="w-8 h-8 rounded-lg bg-[#EAB308] flex items-center justify-center">
                <Check className="w-5 h-5 text-black" style={{ strokeWidth: 3 }} />
              </div>
            )}
          </div>
          <div className="grid grid-cols-[repeat(52,1fr)] gap-1">
            {habit.days.map((day, index) => (
              <div
                key={`${habit.id}-${day.date}`}
                className={`aspect-square rounded-sm ${getActivityStyle(day.completed, habit.lifeArea)}`}
                title={`${day.date}: ${day.completed ? 'Completed' : 'Not completed'}`}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};
