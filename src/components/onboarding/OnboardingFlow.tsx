import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const steps = [
  {
    title: "Willkommen zu deiner Gewohnheitsreise",
    description:
      "In den nächsten 3 Wochen wirst du lernen, wie du nachhaltige Gewohnheiten entwickelst.",
  },
  {
    title: "Phase 1: Bewusstsein schaffen",
    description:
      "Wir beginnen damit, deine aktuellen Gewohnheiten zu verstehen und zu analysieren.",
  },
  {
    title: "Phase 2: Routine etablieren",
    description:
      "Gemeinsam entwickeln wir Routinen, die zu deiner Persönlichkeit und deinem Alltag passen.",
  },
  {
    title: "Phase 3: Automatisierung",
    description:
      "Deine neuen Gewohnheiten werden Teil deines natürlichen Tagesablaufs.",
  },
];

export const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="p-6 space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">
            {steps[currentStep].title}
          </h2>
          <p className="text-text-secondary">{steps[currentStep].description}</p>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index <= currentStep ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <Button onClick={handleNext}>
            {currentStep < steps.length - 1 ? "Weiter" : "Start"}
          </Button>
        </div>
      </Card>
    </div>
  );
};