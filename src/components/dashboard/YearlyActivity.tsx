
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { startOfYear, endOfYear, eachDayOfInterval, format, isSameDay, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

export const YearlyActivity = () => {
  const { data: completions } = useQuery({
    queryKey: ["habit-completions-yearly"],
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

  const currentYear = new Date().getFullYear();
  const yearStart = startOfYear(new Date(currentYear, 0));
  const yearEnd = endOfYear(new Date(currentYear, 0));

  // Generate all days in the current year
  const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

  // Count completions per day and determine level
  const completionsByDay = allDays.map(day => {
    if (!completions) return { day, level: 0, count: 0 };

    // Count completions for this day
    const count = completions.filter(completion => {
      const completionDate = completion.completed_date 
        ? parseISO(completion.completed_date)
        : parseISO(completion.created_at.split('T')[0]);
      return isSameDay(completionDate, day);
    }).length;

    // Determine level based on count
    let level = 0;
    if (count > 0) level = count < 2 ? 1 : count < 4 ? 2 : 3;

    return { day, level, count };
  });

  // Group by month for rendering
  const months = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];

  const groupedByMonth = months.map(month => {
    const monthIndex = months.indexOf(month);
    return {
      month,
      days: completionsByDay.filter(
        ({ day }) => day.getMonth() === monthIndex
      )
    };
  });

  // Colors for activity levels
  const getLevelColor = (level) => {
    switch (level) {
      case 0: return 'bg-gray-100';
      case 1: return 'bg-blue-200';
      case 2: return 'bg-blue-400';
      case 3: return 'bg-blue-600';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="px-1">
      <div className="grid grid-cols-12 gap-1">
        {groupedByMonth.map(({ month, days }) => (
          <div key={month} className="flex flex-col">
            <div className="text-xs font-medium text-center mb-1">{month}</div>
            <div className="grid grid-cols-7 gap-1">
              {/* Fill in empty spots at the beginning of month */}
              {Array.from({ length: days[0]?.day.getDay() || 0 }).map((_, i) => (
                <div key={`empty-${i}`} className="w-3 h-3"></div>
              ))}
              
              {/* Actual days with activity */}
              {days.map(({ day, level, count }) => (
                <TooltipProvider key={format(day, 'yyyy-MM-dd')}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`w-3 h-3 rounded-sm ${getLevelColor(level)} hover:ring-1 hover:ring-black transition-all`}
                      ></div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        <p className="font-medium">{format(day, 'dd. MMMM yyyy', { locale: de })}</p>
                        <p>{count} Aktivitäten</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend below the calendar */}
      <div className="flex justify-center mt-4 text-xs text-gray-600 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-gray-100 mr-1"></div>
          <span>Keine</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-blue-200 mr-1"></div>
          <span>Wenig</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-blue-400 mr-1"></div>
          <span>Mittel</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-blue-600 mr-1"></div>
          <span>Viel</span>
        </div>
      </div>
    </div>
  );
};
