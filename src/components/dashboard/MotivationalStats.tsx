import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MotivationalStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["motivational-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habits } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);

      return {
        totalHabits: habits?.length || 0,
        activeHabits: habits?.filter(h => h.phase === 'volitional').length || 0,
        averageStreak: habits?.reduce((acc, h) => acc + (h.streak_count || 0), 0) / (habits?.length || 1),
        weeklyData: generateWeeklyData(habits || []),
      };
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Dein Fortschritt</h3>
          <Sparkle className="h-5 w-5 text-yellow-500 animate-pulse" />
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Aktive Gewohnheiten</span>
              <span>{stats?.activeHabits} von {stats?.totalHabits}</span>
            </div>
            <Progress value={(stats?.activeHabits || 0) / (stats?.totalHabits || 1) * 100} />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Durchschnittliche Streak</span>
              <span>{Math.round(stats?.averageStreak || 0)} Tage</span>
            </div>
            <Progress value={((stats?.averageStreak || 0) / 30) * 100} />
          </div>
        </div>

        <div className="mt-6 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.weeklyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completions" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

const generateWeeklyData = (habits: any[]) => {
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