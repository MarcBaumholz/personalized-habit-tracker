
import { useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { CommitmentPact } from "@/components/onboarding/CommitmentPact";
import { DeepInterview } from "@/components/onboarding/DeepInterview";
import { PersonalityQuiz } from "@/components/onboarding/PersonalityQuiz";
import { LifeAreasSelection } from "@/components/onboarding/LifeAreasSelection";
import { KeystoneHabitsSetup } from "@/components/onboarding/KeystoneHabitsSetup";

const Onboarding = () => {
  const [step, setStep] = useState(1);

  const handleStepComplete = () => {
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {step === 1 && <CommitmentPact onComplete={handleStepComplete} />}
      {step === 2 && <DeepInterview onComplete={handleStepComplete} />}
      {step === 3 && <PersonalityQuiz onComplete={handleStepComplete} />}
      {step === 4 && <LifeAreasSelection onComplete={handleStepComplete} />}
      {step === 5 && <KeystoneHabitsSetup onComplete={handleStepComplete} />}
    </div>
  );
};

export default Onboarding;
