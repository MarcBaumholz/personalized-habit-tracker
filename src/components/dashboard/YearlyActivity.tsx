
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface YearlyActivityProps {
  data: Array<Array<{ date: string; count: number; lifeArea?: string }>>;
}

const LIFE_AREA_COLORS = {
  "Gesundheit": "#F97316",
  "Beziehungen": "#D946EF",
  "Karriere": "#0EA5E9",
  "Finanzen": "#8B5CF6",
  "Persönlichkeit": "#22C55E",
  "Freizeit": "#EAB308",
  "Spiritualität": "#EC4899",
  "Umwelt": "#14B8A6"
};

export const YearlyActivity = () => {
  const { data: habits } = useQuery({
    queryKey: ["habits-activity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*, habit_completions(completed_date)")
        .eq("user_id", user.id);

      // Create a map of dates to their completion counts and life areas
      const completionMap = new Map();
      
      habitsData?.forEach(habit => {
        habit.habit_completions?.forEach((completion: any) => {
          const date = completion.completed_date;
          if (!completionMap.has(date)) {
            completionMap.set(date, { count: 0, areas: new Set() });
          }
          const dateData = completionMap.get(date);
          dateData.count++;
          dateData.areas.add(habit.life_area);
          completionMap.set(date, dateData);
        });
      });

      // Generate the last 52 weeks of data
      const weeks = [];
      let currentDate = new Date();
      
      for (let week = 0; week < 52; week++) {
        const weekData = [];
        for (let day = 6; day >= 0; day--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - day);
          const dateStr = format(date, 'yyyy-MM-dd');
          const completionData = completionMap.get(dateStr) || { count: 0, areas: new Set() };
          
          weekData.push({
            date: dateStr,
            count: completionData.count,
            areas: Array.from(completionData.areas)
          });
        }
        weeks.push(weekData);
        currentDate.setDate(currentDate.getDate() - 7);
      }

      return weeks.reverse();
    }
  });

  const getBackgroundColor = (count: number, areas: string[]) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    const area = areas[0]; // Use the first area as the primary color
    const color = LIFE_AREA_COLORS[area as keyof typeof LIFE_AREA_COLORS] || '#94A3B8';
    const opacity = count < 3 ? '30' : count < 5 ? '60' : '';
    return `bg-[${color}${opacity}]`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Jahresübersicht der Gewohnheiten</h2>
      <div className="grid grid-cols-52 gap-1">
        {data?.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`w-3 h-3 rounded-sm ${getBackgroundColor(day.count, day.areas || [])}`}
                title={`${day.date}: ${day.count} Abschlüsse`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <span>Weniger</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-primary/30" />
        <div className="w-3 h-3 rounded-sm bg-primary/60" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>Mehr</span>
      </div>
    </Card>
  );
};
