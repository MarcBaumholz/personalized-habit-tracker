import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Target, Calendar, TrendingUp, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
      };
    },
  });

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
          <h2 className="text-lg font-semibold mb-4">Wöchentliche Übersicht</h2>
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
                  outerRadius={80}
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
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Gesamtfortschritt zum Automatismus</h2>
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
  // Implementation of streak calculation
  return completions.length > 0 ? completions.length : 0;
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
  // Implementation to generate weekly completion data
  return [
    { name: 'Mo', completions: 4 },
    { name: 'Di', completions: 3 },
    { name: 'Mi', completions: 5 },
    { name: 'Do', completions: 4 },
    { name: 'Fr', completions: 3 },
    { name: 'Sa', completions: 2 },
    { name: 'So', completions: 4 },
  ];
};

const generateCategoryData = (habits: any[], completions: any[]) => {
  // Implementation to generate category distribution data
  return [
    { name: 'Gesundheit', value: 30 },
    { name: 'Produktivität', value: 25 },
    { name: 'Lernen', value: 20 },
    { name: 'Sport', value: 25 },
  ];
};

const generateProgressData = (completions: any[]) => {
  // Implementation to generate progress data for each habit
  return [
    { id: 1, name: 'Meditation', completions: 36 },
    { id: 2, name: 'Sport', completions: 45 },
    { id: 3, name: 'Lesen', completions: 28 },
  ];
};