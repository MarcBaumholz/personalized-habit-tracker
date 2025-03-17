
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

    // Determine level based on count - simplified to 3 levels
    let level = 0;
    if (count > 0) level = count < 2 ? 1 : count < 4 ? 2 : 3;

    return { day, level, count };
  });

  // Group by month
  const months = [
    'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
  ];

  // Prepare data for rendering: group days by month
  const groupedByMonth = months.map(month => {
    const monthIndex = months.indexOf(month);
    return {
      month,
      days: completionsByDay.filter(
        ({ day }) => day.getMonth() === monthIndex
      )
    };
  });

  // Group by weekday for rendering
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const daysByWeekday = weekdays.map(weekday => {
    const weekdayIndex = weekdays.indexOf(weekday);
    // Adjust the weekday index because Date.getDay() returns 0 for Sunday
    const adjustedWeekdayIndex = (weekdayIndex + 1) % 7;
    return {
      weekday: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'][weekdayIndex],
      days: completionsByDay.filter(
        ({ day }) => day.getDay() === adjustedWeekdayIndex
      )
    };
  });

  // Total contribution count for the header
  const totalContributions = completionsByDay.reduce((sum, { count }) => sum + count, 0);

  // Colors for activity levels - using more vibrant greens for better visibility
  const getLevelColor = (level) => {
    switch (level) {
      case 0: return 'bg-gray-100 border border-gray-200';
      case 1: return 'bg-green-300 border border-green-400';
      case 2: return 'bg-green-500 border border-green-600';
      case 3: return 'bg-green-700 border border-green-800';
      default: return 'bg-gray-100 border border-gray-200';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{totalContributions} Aktivitäten im letzten Jahr</h2>
      </div>

      {/* Month headers */}
      <div className="grid grid-cols-12 gap-1 mb-1">
        {months.map(month => (
          <div key={month} className="text-xs text-center font-medium">
            {month}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex">
        {/* Weekday labels */}
        <div className="pr-2 flex flex-col justify-around">
          {daysByWeekday.slice(0, 5).map(({ weekday }) => (
            <div key={weekday} className="text-xs text-gray-500">
              {weekday}
            </div>
          ))}
        </div>

        {/* Activity grid */}
        <div className="flex-grow grid grid-cols-12 gap-x-1">
          {groupedByMonth.map(({ month, days }) => (
            <div key={month} className="flex flex-col gap-1">
              {/* Calculate days to display for this month */}
              <div className="grid grid-cols-7 grid-rows-5 gap-1">
                {Array.from({ length: 35 }).map((_, idx) => {
                  const dayOfMonth = idx % 7; // 0-6 for weekdays
                  const weekOfMonth = Math.floor(idx / 7); // 0-4 for weeks
                  
                  // Find the day that matches this position
                  const dayData = days.find(({ day }) => 
                    day.getDay() === (dayOfMonth + 1) % 7 && // Adjust for week starting with Monday
                    Math.floor((day.getDate() - 1) / 7) === weekOfMonth
                  );
                  
                  if (!dayData) return <div key={idx} className="w-3 h-3"></div>;
                  
                  return (
                    <TooltipProvider key={idx}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className={`w-3 h-3 ${getLevelColor(dayData.level)} rounded-sm hover:ring-1 hover:ring-black`}
                          ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">
                            <p className="font-medium">{format(dayData.day, 'dd. MMMM yyyy', { locale: de })}</p>
                            <p>{dayData.count} Aktivitäten</p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend at the bottom */}
      <div className="flex justify-end mt-6 text-xs text-gray-600 space-x-2 items-center">
        <span>Weniger</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
          <div className="w-3 h-3 rounded-sm bg-green-300 border border-green-400"></div>
          <div className="w-3 h-3 rounded-sm bg-green-500 border border-green-600"></div>
          <div className="w-3 h-3 rounded-sm bg-green-700 border border-green-800"></div>
        </div>
        <span>Mehr</span>
      </div>
    </div>
  );
};
