import { useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { CommitmentPact } from "@/components/onboarding/CommitmentPact";
import { DeepInterview } from "@/components/onboarding/DeepInterview";
import { PersonalityQuiz } from "@/components/onboarding/PersonalityQuiz";

const Onboarding = () => {
  const [step, setStep] = useState(1);

  const handleStepComplete = () => {
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {step === 1 && <CommitmentPact onComplete={handleStepComplete} />}
      {step === 2 && <DeepInterview onComplete={handleStepComplete} />}
      {step === 3 && <PersonalityQuiz />}
    </div>
  );
};

export default Onboarding;