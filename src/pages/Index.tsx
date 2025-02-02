import { Navigation } from "@/components/layout/Navigation";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { TodoList } from "@/components/dashboard/TodoList";
import { ProgressStats } from "@/components/dashboard/ProgressStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";
import { SurpriseAnimation } from "@/components/feedback/SurpriseAnimation";
import { useSurpriseAnimation } from "@/hooks/useSurpriseAnimation";

const Index = () => {
  const { data: hasCompletedOnboarding } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", user.id);

      return (data?.length || 0) >= 6;
    },
  });

  const { animations, triggerAnimation } = useSurpriseAnimation();

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-20 animate-fade-in">
        {animations.map(({ id, x, y }) => (
          <SurpriseAnimation key={id} position={{ x, y }} />
        ))}
        
        <div className="space-y-6">
          <ProgressStats />
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <HabitTracker />
            </div>
            <TodoList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;