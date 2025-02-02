import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Target, Calendar, TrendingUp, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const RADIAN = Math.PI / 180;

export const DashboardOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ["habit-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: completions } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", user.id);

      const { data: habits } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);

      return {
        streak: calculateStreak(completions || []),
        successRate: calculateSuccessRate(completions || [], habits || []),
        activeDays: calculateActiveDays(completions || []),
        totalProgress: calculateTotalProgress(completions || [], habits || []),
        weeklyData: generateWeeklyData(completions || []),
        categoryData: generateCategoryData(habits || [], completions || []),
        progressData: generateProgressData(completions || []),
        yearlyActivity: generateYearlyActivity(completions || []),
      };
    },
  });

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dein Fortschritt</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aktuelle Streak</p>
            <p className="text-2xl font-bold">{stats?.streak || 0} Tage</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Erfolgsquote</p>
            <p className="text-2xl font-bold">{stats?.successRate || 0}%</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aktive Tage</p>
            <p className="text-2xl font-bold">{stats?.activeDays || 0}/30</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Level</p>
            <p className="text-2xl font-bold">{Math.floor((stats?.totalProgress || 0) / 10) + 1}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Kategorien Verteilung</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.categoryData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Wöchentlicher Fortschritt</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.weeklyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completions" stroke="hsl(var(--primary))" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Jahresübersicht</h2>
        <div className="grid grid-cols-52 gap-1">
          {stats?.yearlyActivity?.map((week: any[], weekIndex: number) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {week.map((day: any, dayIndex: number) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${
                    day.count === 0
                      ? 'bg-gray-100'
                      : day.count < 3
                      ? 'bg-primary/30'
                      : day.count < 5
                      ? 'bg-primary/60'
                      : 'bg-primary'
                  }`}
                  title={`${day.date}: ${day.count} completions`}
                />
              ))}
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Gewohnheiten Fortschritt</h2>
        <div className="space-y-6">
          {stats?.progressData?.map((habit: any) => (
            <div key={habit.id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{habit.name}</span>
                <span>{habit.completions}/66 Tage</span>
              </div>
              <Progress value={(habit.completions / 66) * 100} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const calculateStreak = (completions: any[]) => {
  if (completions.length === 0) return 0;
  
  const sortedCompletions = completions
    .map(c => new Date(c.completed_date).toISOString().split('T')[0])
    .sort();
  
  let currentStreak = 1;
  let maxStreak = 1;
  
  for (let i = 1; i < sortedCompletions.length; i++) {
    const prevDate = new Date(sortedCompletions[i - 1]);
    const currDate = new Date(sortedCompletions[i]);
    const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

const calculateSuccessRate = (completions: any[], habits: any[]) => {
  if (habits.length === 0) return 0;
  return Math.round((completions.length / (habits.length * 30)) * 100);
};

const calculateActiveDays = (completions: any[]) => {
  const uniqueDays = new Set(completions.map(c => c.completed_date));
  return uniqueDays.size;
};

const calculateTotalProgress = (completions: any[], habits: any[]) => {
  if (habits.length === 0) return 0;
  return Math.round((completions.length / (habits.length * 66)) * 100);
};

const generateWeeklyData = (completions: any[]) => {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const weeklyData = days.map(day => ({
    name: day,
    completions: completions.filter(c => 
      new Date(c.completed_date).toLocaleDateString('de-DE', { weekday: 'short' }) === day
    ).length
  }));
  
  return weeklyData;
};

const generateCategoryData = (habits: any[], completions: any[]) => {
  const categories = habits.reduce((acc: any, habit: any) => {
    const category = habit.category;
    if (!acc[category]) {
      acc[category] = {
        name: category,
        value: completions.filter((c: any) => c.habit_id === habit.id).length
      };
    } else {
      acc[category].value += completions.filter((c: any) => c.habit_id === habit.id).length;
    }
    return acc;
  }, {});

  return Object.values(categories);
};

const generateProgressData = (completions: any[]) => {
  const habitProgress = completions.reduce((acc: any, completion: any) => {
    if (!acc[completion.habit_id]) {
      acc[completion.habit_id] = {
        id: completion.habit_id,
        name: 'Habit ' + completion.habit_id,
        completions: 1
      };
    } else {
      acc[completion.habit_id].completions++;
    }
    return acc;
  }, {});

  return Object.values(habitProgress);
};

const generateYearlyActivity = (completions: any[]) => {
  const year = new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const days = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: completions.filter(c => c.completed_date === dateStr).length
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  
  return weeks;
};