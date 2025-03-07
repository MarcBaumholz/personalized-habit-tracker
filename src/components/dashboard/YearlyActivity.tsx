import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfYear, eachDayOfInterval, endOfYear, getDay, subYears, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Check, Star, ChevronLeft, ChevronRight, BarChart2, Calendar, PieChart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';

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
const CHART_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export const YearlyActivity = () => {
  const [activeView, setActiveView] = useState<"yearly" | "weekly" | "category">("yearly");
  const [activeHabitIndex, setActiveHabitIndex] = useState(0);

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

  const { data: weeklyData } = useQuery({
    queryKey: ["weekly-progress"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const today = new Date();
      const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
      const weeklyStats = daysOfWeek.map(day => ({ name: day, completions: 0 }));

      const { data: completions } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", user.id)
        .gte("completed_date", format(subYears(today, 1), 'yyyy-MM-dd'));

      if (completions) {
        completions.forEach((completion: any) => {
          const date = new Date(completion.completed_date);
          const dayOfWeek = (date.getDay() + 6) % 7;
          weeklyStats[dayOfWeek].completions += 1;
        });
      }

      return weeklyStats;
    }
  });

  const { data: categoryData } = useQuery({
    queryKey: ["category-distribution"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habits } = await supabase
        .from("habits")
        .select("category")
        .eq("user_id", user.id);

      if (!habits) return [];

      const categories: Record<string, number> = {};
      habits.forEach((habit: any) => {
        if (habit.category) {
          categories[habit.category] = (categories[habit.category] || 0) + 1;
        }
      });

      return Object.entries(categories).map(([name, value]) => ({ name, value }));
    }
  });

  const getCompletionColor = (colorType: string, intensity: number) => {
    return COMPLETION_COLORS[colorType as keyof typeof COMPLETION_COLORS][intensity as keyof typeof COMPLETION_COLORS["check"]];
  };

  const navigateHabit = (direction: 'prev' | 'next') => {
    if (habitsData.length === 0) return;
    
    if (direction === 'prev') {
      setActiveHabitIndex(prev => (prev === 0 ? habitsData.length - 1 : prev - 1));
    } else {
      setActiveHabitIndex(prev => (prev === habitsData.length - 1 ? 0 : prev + 1));
    }
  };

  const renderYearlyView = () => {
    const habit = habitsData[activeHabitIndex];
    if (!habit) return null;

    return (
      <div className="space-y-6">
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
      </div>
    );
  };

  const renderWeeklyView = () => {
    if (!weeklyData) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4 text-white">Wöchentlicher Fortschritt</h2>
        <div className="h-[250px] md:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={weeklyData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: "#ccc" }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "#ccc" }}
                width={30}
              />
              <Tooltip contentStyle={{ backgroundColor: "#222", borderColor: "#444" }} />
              <Line 
                type="monotone" 
                dataKey="completions" 
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderCategoryView = () => {
    if (!categoryData) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Kategorienverteilung</h3>
        <div className="h-[250px] md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend 
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '12px', color: '#ccc' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <Card className="border-none shadow-md bg-gray-950 overflow-hidden">
      <CardHeader className="bg-gray-900 pb-4 pt-5 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl text-white">Aktivitätsübersicht</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 h-8 w-8 p-0" 
              onClick={() => navigateHabit('prev')}
              disabled={!habitsData || habitsData.length <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-400 min-w-[60px] text-center">
              {habitsData ? `${activeHabitIndex + 1} / ${habitsData.length}` : '0 / 0'}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 h-8 w-8 p-0" 
              onClick={() => navigateHabit('next')}
              disabled={!habitsData || habitsData.length <= 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b border-gray-800 bg-gray-900">
          <div className="flex px-6 py-2">
            <Button 
              variant={activeView === "yearly" ? "default" : "ghost"}
              size="sm" 
              className={activeView === "yearly" 
                ? "rounded-full bg-blue-600 hover:bg-blue-700 text-white" 
                : "rounded-full text-gray-400 hover:text-white hover:bg-gray-800"}
              onClick={() => setActiveView("yearly")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Jahresübersicht
            </Button>
            <Button 
              variant={activeView === "weekly" ? "default" : "ghost"}
              size="sm" 
              className={activeView === "weekly" 
                ? "rounded-full bg-blue-600 hover:bg-blue-700 text-white" 
                : "rounded-full text-gray-400 hover:text-white hover:bg-gray-800"}
              onClick={() => setActiveView("weekly")}
            >
              <BarChart2 className="h-4 w-4 mr-2" />
              Wöchentlich
            </Button>
            <Button 
              variant={activeView === "category" ? "default" : "ghost"}
              size="sm" 
              className={activeView === "category" 
                ? "rounded-full bg-blue-600 hover:bg-blue-700 text-white" 
                : "rounded-full text-gray-400 hover:text-white hover:bg-gray-800"}
              onClick={() => setActiveView("category")}
            >
              <PieChart className="h-4 w-4 mr-2" />
              Kategorien
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {!habitsData ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-400">Daten werden geladen...</p>
            </div>
          ) : habitsData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-400">Keine Gewohnheiten vorhanden</p>
            </div>
          ) : (
            <>
              {activeView === "yearly" && renderYearlyView()}
              {activeView === "weekly" && renderWeeklyView()}
              {activeView === "category" && renderCategoryView()}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
