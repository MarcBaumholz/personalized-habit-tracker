
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowRight } from "lucide-react";

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
    setStep(step + 1);
  };

  const skipToHome = () => {
    toast({
      title: "Onboarding abgeschlossen",
      description: "Du wirst zur Startseite weitergeleitet...",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8">
      {step === 1 && <CommitmentPact onComplete={handleStepComplete} />}
      {step === 2 && <DeepInterview onComplete={handleStepComplete} />}
      {step === 3 && <PersonalityQuiz onComplete={handleStepComplete} />}
      {step === 4 && <LifeAreasSelection onComplete={handleStepComplete} />}
      {step === 5 && (
        <>
          {keystoneHabits && keystoneHabits.length > 0 && (
            <div className="max-w-2xl mx-auto mb-6">
              <Alert className="bg-blue-50 border-blue-200 mb-4">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-700 text-lg">
                  Du hast bereits Keystone Habits
                </AlertTitle>
                <AlertDescription className="text-blue-600">
                  <div className="mb-3">
                    Du hast bereits {keystoneHabits.length} Keystone Habits definiert:
                  </div>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    {keystoneHabits.slice(0, 3).map((habit) => (
                      <li key={habit.id} className="text-blue-800">
                        {habit.habit_name} ({habit.life_area})
                      </li>
                    ))}
                    {keystoneHabits.length > 3 && (
                      <li className="text-blue-800">...und weitere</li>
                    )}
                  </ul>
                  <div className="flex justify-between items-center mt-2">
                    <span>Du kannst diesen Schritt überspringen oder weitere Habits hinzufügen.</span>
                    <Button 
                      onClick={skipToHome}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Überspringen <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          )}
          <KeystoneHabitsSetup 
            onComplete={handleStepComplete} 
            existingHabits={keystoneHabits || []}
          />
        </>
      )}
    </div>
  );
};

export default Onboarding;
