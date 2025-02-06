
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfYear, eachDayOfInterval, endOfYear } from "date-fns";
import { de } from "date-fns/locale";

const LIFE_AREA_COLORS = {
  "Gesundheit": "#22C55E",      // Green for health
  "Beziehungen": "#EC4899",     // Pink for relationships
  "Karriere": "#3B82F6",        // Blue for career
  "Finanzen": "#8B5CF6",        // Purple for finances
  "Persönlichkeit": "#F97316",  // Orange for personal development
  "Freizeit": "#EAB308",        // Yellow for leisure
  "Spiritualität": "#14B8A6",   // Teal for spirituality
  "Umwelt": "#64748B",          // Slate for environment
};

export const YearlyActivity = () => {
  const { data: habitsData } = useQuery({
    queryKey: ["habits-activity"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*, habit_completions(completed_date), life_area")
        .eq("user_id", user.id);

      // Create a map of dates to their completion counts and life areas
      const completionMap = new Map();
      
      habitsData?.forEach(habit => {
        habit.habit_completions?.forEach((completion: any) => {
          const date = completion.completed_date;
          if (!completionMap.has(date)) {
            completionMap.set(date, { count: 0, lifeArea: habit.life_area || 'Persönlichkeit' });
          }
          const dateData = completionMap.get(date);
          dateData.count++;
          completionMap.set(date, dateData);
        });
      });

      // Generate the full year of data
      const start = startOfYear(new Date());
      const end = endOfYear(new Date());
      const allDays = eachDayOfInterval({ start, end });
      
      // Group days into weeks
      const weeks = [];
      let currentWeek: any[] = [];
      
      allDays.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completionData = completionMap.get(dateStr) || { count: 0, lifeArea: 'Persönlichkeit' };
        
        currentWeek.push({
          date: dateStr,
          count: completionData.count,
          lifeArea: completionData.lifeArea,
          dayName: format(date, 'EEEEEE', { locale: de }).toUpperCase(),
          month: format(date, 'MMM', { locale: de }),
        });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      });

      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }

      return weeks;
    }
  });

  const getActivityColor = (count: number, lifeArea: string) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    const baseColor = LIFE_AREA_COLORS[lifeArea as keyof typeof LIFE_AREA_COLORS] || '#64748B';
    
    let opacity;
    if (count === 1) opacity = '33';      // Light
    else if (count === 2) opacity = '66';  // Medium
    else opacity = '';                     // Full color

    return opacity ? `bg-[${baseColor}${opacity}]` : `bg-[${baseColor}]`;
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Jahresübersicht der Gewohnheiten</h2>
      <div className="flex">
        <div className="flex flex-col gap-1 text-xs text-gray-400 mr-2">
          <span>Mo</span>
          <span>Di</span>
          <span>Mi</span>
          <span>Do</span>
          <span>Fr</span>
          <span>Sa</span>
          <span>So</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-1">
            {habitsData?.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-3 h-3 rounded-sm ${getActivityColor(day.count, day.lifeArea)}`}
                    title={`${day.date}: ${day.count} Abschlüsse`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-2 flex text-xs text-gray-400">
            {habitsData?.[0]?.map((_, monthIndex) => (
              monthIndex % 4 === 0 && (
                <span key={monthIndex} className="w-12">{habitsData[0][monthIndex].month}</span>
              )
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <span>Weniger</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-[#22C55E33]" />
        <div className="w-3 h-3 rounded-sm bg-[#22C55E66]" />
        <div className="w-3 h-3 rounded-sm bg-[#22C55E]" />
        <span>Mehr</span>
      </div>
    </Card>
  );
};
