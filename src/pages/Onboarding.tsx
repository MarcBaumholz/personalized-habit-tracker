
import { useState, useEffect } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { CommitmentPact } from "@/components/onboarding/CommitmentPact";
import { DeepInterview } from "@/components/onboarding/DeepInterview";
import { PersonalityQuiz } from "@/components/onboarding/PersonalityQuiz";
import { LifeAreasSelection } from "@/components/onboarding/LifeAreasSelection";
import { KeystoneHabitsSetup } from "@/components/onboarding/KeystoneHabitsSetup";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Query for existing keystone habits
  const { data: keystoneHabits, isLoading: loadingHabits } = useQuery({
    queryKey: ["keystone-habits-onboarding"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("keystone_habits")
        .select("*")
        .eq("user_id", user.id);

      return data || [];
    },
  });

  const handleStepComplete = () => {
    // If we're going to the keystone habits step (step 4 -> 5) and user already has keystone habits,
    // show a message allowing them to skip this step
    if (step === 4 && keystoneHabits && keystoneHabits.length > 0) {
      toast({
        title: "Keystone Habits bereits vorhanden",
        description: "Du hast bereits Keystone Habits definiert. Du kannst diesen Schritt überspringen oder neue hinzufügen.",
        action: (
          <Button 
            onClick={() => navigate("/")} 
            variant="outline"
            className="bg-blue-100 hover:bg-blue-200 border-blue-300"
          >
            Überspringen
          </Button>
        ),
      });
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {step === 1 && <CommitmentPact onComplete={handleStepComplete} />}
      {step === 2 && <DeepInterview onComplete={handleStepComplete} />}
      {step === 3 && <PersonalityQuiz onComplete={handleStepComplete} />}
      {step === 4 && <LifeAreasSelection onComplete={handleStepComplete} />}
      {step === 5 && (
        <KeystoneHabitsSetup 
          onComplete={handleStepComplete} 
          existingHabits={keystoneHabits || []}
        />
      )}
    </div>
  );
};

export default Onboarding;
