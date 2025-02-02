import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const HabitJourney = () => {
  const { data: habits } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: habitsData } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("user_id", user.id);

      return habitsData;
    },
  });

  return (
    <Card className="p-6 bg-white">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Gesamtfortschritt zum Automatismus</h2>
      
      <div className="space-y-6">
        {habits?.map((habit: any) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{habit.name}</span>
              <span className="text-gray-600">
                {habit.habit_completions?.length || 0}/66 Tage
              </span>
            </div>
            <Progress 
              value={(habit.habit_completions?.length || 0) / 66 * 100} 
              className="h-2"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};