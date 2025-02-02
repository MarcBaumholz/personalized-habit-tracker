import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ProgressStats = () => {
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
      };
    },
  });

  return (
    <div className="space-y-4">
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
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fortschritt</p>
            <p className="text-2xl font-bold">{stats?.totalProgress || 0}%</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Gesamtfortschritt zum Automatismus</h2>
        <Progress value={stats?.totalProgress || 0} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          {stats?.totalProgress || 0}% aller Gewohnheiten auf dem Weg zur Automatisierung
        </p>
      </Card>
    </div>
  );
};

const calculateStreak = (completions: any[]) => {
  if (completions.length === 0) return 0;
  
  const sortedCompletions = completions
    .map(c => new Date(c.completed_date))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  for (let i = 1; i < sortedCompletions.length; i++) {
    const diff = Math.abs(sortedCompletions[i-1].getTime() - sortedCompletions[i].getTime());
    if (diff <= 86400000) { // 24 hours in milliseconds
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
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