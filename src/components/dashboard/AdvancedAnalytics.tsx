
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { format, startOfMonth, eachDayOfInterval, endOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdvancedAnalytics = () => {
  const navigate = useNavigate();
  
  const handleBackToToolbox = () => {
    navigate('/toolbox');
  };

  const { data: analyticsData } = useQuery({
    queryKey: ["habit-analytics"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: completions } = await supabase
        .from("habit_completions")
        .select("*, habits(name, life_area)")
        .eq("user_id", user.id);

      const { data: emotions } = await supabase
        .from("habit_emotions")
        .select("*")
        .eq("user_id", user.id);

      const { data: reflections } = await supabase
        .from("habit_reflections")
        .select("*")
        .eq("user_id", user.id);

      return {
        completions: completions || [],
        emotions: emotions || [],
        reflections: reflections || []
      };
    }
  });

  const monthlyData = analyticsData?.completions.reduce((acc: any[], completion) => {
    const month = format(new Date(completion.completed_date), 'MMM', { locale: de });
    const existingMonth = acc.find(item => item.month === month);
    
    if (existingMonth) {
      existingMonth.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    
    return acc;
  }, []) || [];

  const emotionDistribution = analyticsData?.emotions.reduce((acc: any, emotion) => {
    acc[emotion.emotion] = (acc[emotion.emotion] || 0) + 1;
    return acc;
  }, {});

  const emotionData = Object.entries(emotionDistribution || {}).map(([emotion, count]) => ({
    emotion,
    count
  }));

  const progressData = analyticsData?.reflections.map(reflection => ({
    date: format(new Date(reflection.created_at), 'dd.MM'),
    score: reflection.srhi_score
  })).slice(-10) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">Erweiterte Analyse</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBackToToolbox}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Toolbox
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Monatliche Aktivität</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={30}
                />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Emotions-Verteilung</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={emotionData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="emotion" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  width={30}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Gewohnheits-Stärke (SRHI)</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={progressData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12 }}
                  width={30}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Lebensbereiche Aktivität</h3>
          <div className="h-[250px] md:h-[300px]">
            {/* Hier kommt ein weiterer Graph für die Verteilung der Aktivitäten nach Lebensbereichen */}
          </div>
        </Card>
      </div>
    </div>
  );
};
