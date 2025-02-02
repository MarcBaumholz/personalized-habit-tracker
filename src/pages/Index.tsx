import { Navigation } from "@/components/layout/Navigation";
import { HabitJourney } from "@/components/habits/HabitJourney";
import { TodoList } from "@/components/dashboard/TodoList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { data: hasCompletedOnboarding, isLoading } = useQuery({
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="space-y-6">
          <TodoList />
          <HabitJourney />
        </div>
      </main>
    </div>
  );
};

export default Index;