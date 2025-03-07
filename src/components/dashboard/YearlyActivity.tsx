
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const colorsByLevel = {
  0: "bg-gray-100",
  1: "bg-blue-200",
  2: "bg-blue-300",
  3: "bg-blue-400",
  4: "bg-blue-500"
};

type Activity = {
  date: string;
  count: number;
};

export const YearlyActivity = () => {
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxCount, setMaxCount] = useState(1);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("No user found");
        }

        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        oneYearAgo.setDate(oneYearAgo.getDate() - 1);
        
        const { data, error } = await supabase
          .from("habit_completions")
          .select("created_at, habit_id")
          .eq("user_id", user.id)
          .gte("created_at", oneYearAgo.toISOString())
          .lte("created_at", today.toISOString());
          
        if (error) {
          throw error;
        }
        
        // Group completions by date
        const groupedByDate: Record<string, number> = {};
        data?.forEach(completion => {
          const dateStr = completion.created_at.split('T')[0];
          if (!groupedByDate[dateStr]) {
            groupedByDate[dateStr] = 0;
          }
          groupedByDate[dateStr]++;
        });
        
        // Convert to array format needed for the grid
        const activitiesArray = Object.entries(groupedByDate).map(([date, count]) => ({
          date,
          count,
        }));
        
        // Find the maximum count for normalizing the heat map
        const max = Math.max(...Object.values(groupedByDate), 1);
        setMaxCount(max);
        
        // Calculate completion rate
        const totalDays = 365;
        const daysWithActivity = Object.keys(groupedByDate).length;
        const rate = Math.round((daysWithActivity / totalDays) * 100);
        setCompletionRate(rate);
        
        setActivities(activitiesArray);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Fehler",
          description: "Die Aktivitäten konnten nicht geladen werden.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [toast]);

  // Generate dates for the grid
  const generateDatesGrid = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const dates = [];
    let currentDate = new Date(oneYearAgo);
    
    while (currentDate <= today) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const dates = generateDatesGrid();
  
  // Group dates by week for the grid layout
  const getWeeksArray = () => {
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    
    // Start with the first day's weekday offset
    const firstDate = dates[0];
    const firstDayOfWeek = firstDate.getDay();
    
    // Add empty cells for the first week
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(new Date(0)); // Empty date
    }
    
    // Add all dates to the grid
    dates.forEach((date) => {
      currentWeek.push(date);
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add empty cells for the last week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(0)); // Empty date
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };
  
  const weeks = getWeeksArray();
  
  // Get activity level (0-4) for a specific date
  const getActivityLevel = (date: Date) => {
    if (date.getTime() === 0) return 0; // Empty cell
    
    const dateStr = date.toISOString().split('T')[0];
    const activity = activities.find(a => a.date === dateStr);
    
    if (!activity) return 0;
    
    // Normalize count to 0-4 level
    const level = Math.min(Math.ceil((activity.count / maxCount) * 4), 4);
    return level;
  };
  
  // Get class name for a specific activity level
  const getColorClass = (level: number) => {
    return colorsByLevel[level as keyof typeof colorsByLevel] || "bg-gray-100";
  };

  // Days of the week for labels
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  return (
    <Card className="bg-white shadow-sm border border-blue-100 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-blue-800 flex justify-between items-center">
          <span>Jahresübersicht</span>
          <div className="text-sm font-normal text-blue-600">
            {completionRate}% Aktivitätstage
          </div>
        </CardTitle>
        <Progress value={completionRate} className="h-2 mt-1" />
      </CardHeader>
      <CardContent className="pb-6">
        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-gray-500">Lade Aktivitäten...</p>
          </div>
        ) : (
          <div>
            <div className="flex mb-1">
              <div className="w-6"></div>
              <div className="grid grid-cols-52 gap-1 flex-grow overflow-x-auto pb-2">
                {Array.from({ length: 12 }).map((_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - 11 + i);
                  return (
                    <div key={i} className="text-[9px] text-gray-500 text-center col-span-4 ml-1">
                      {date.toLocaleDateString('de-DE', { month: 'short' })}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex">
              <div className="flex flex-col mr-2">
                {weekdays.map((day, i) => (
                  <div key={i} className="h-4 w-4 text-[9px] text-gray-500 flex items-center justify-center my-[1px]">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="flex-grow overflow-hidden">
                <div className="grid grid-rows-7 grid-flow-col gap-[2px]">
                  {weeks.map((week, weekIndex) => (
                    week.map((date, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`h-4 w-4 rounded-sm ${getColorClass(getActivityLevel(date))} transition-colors`}
                        title={date.getTime() !== 0 ? 
                          `${date.toLocaleDateString('de-DE')}: ${activities.find(a => a.date === date.toISOString().split('T')[0])?.count || 0} Aktivitäten` 
                          : ''}
                      />
                    ))
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end mt-2 gap-1">
              <span className="text-[10px] text-gray-500 mr-1">Weniger</span>
              {[0, 1, 2, 3, 4].map(level => (
                <div 
                  key={level} 
                  className={`h-3 w-3 rounded-sm ${getColorClass(level)}`}
                />
              ))}
              <span className="text-[10px] text-gray-500 ml-1">Mehr</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
