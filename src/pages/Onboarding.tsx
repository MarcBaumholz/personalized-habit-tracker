import { useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { PersonalityQuiz } from "@/components/onboarding/PersonalityQuiz";

const Onboarding = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      {step === 1 && <OnboardingFlow onComplete={() => setStep(2)} />}
      {step === 2 && <PersonalityQuiz />}
    </div>
  );
};

export default Onboarding;