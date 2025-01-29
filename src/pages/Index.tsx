import { Navigation } from "@/components/layout/Navigation";
import { HabitTracker } from "@/components/habits/HabitTracker";
import { WeeklyReflection } from "@/components/habits/WeeklyReflection";
import { ProgressStats } from "@/components/dashboard/ProgressStats";
import { TodoList } from "@/components/dashboard/TodoList";
import { CommitmentPact } from "@/components/onboarding/CommitmentPact";
import { DeepInterview } from "@/components/onboarding/DeepInterview";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const Index = () => {
  const [onboardingStep, setOnboardingStep] = useState<"pact" | "interview" | "complete">("pact");

  const { data: hasCompletedOnboarding } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", user.id);

      return (data?.length || 0) >= 6; // Commitment + 5 interview questions
    },
  });

  if (!hasCompletedOnboarding) {
    if (onboardingStep === "pact") {
      return <CommitmentPact onComplete={() => setOnboardingStep("interview")} />;
    }
    if (onboardingStep === "interview") {
      return <DeepInterview onComplete={() => setOnboardingStep("complete")} />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <ProgressStats />
        
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="space-y-6">
            <HabitTracker />
            <TodoList />
          </div>
          <WeeklyReflection />
        </div>
      </main>
    </div>
  );
};

export default Index;