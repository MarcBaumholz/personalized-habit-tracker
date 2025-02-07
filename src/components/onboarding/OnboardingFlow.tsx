
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Check, Brain, Star, Users, Heart, Coffee } from "lucide-react";

const steps = [
  {
    title: "Willkommen zu deiner Gewohnheitsreise",
    description:
      "In den nächsten Schritten werden wir dein persönliches Profil erstellen und deine Ziele definieren.",
    icon: Check,
  },
  {
    title: "Persönlichkeitsanalyse",
    description:
      "Lass uns herausfinden, welcher Persönlichkeitstyp du bist und wie das deine Gewohnheiten beeinflusst.",
    icon: Brain,
  },
  {
    title: "Lebensbereiche & Ziele",
    description:
      "Wähle die Lebensbereiche aus, die du entwickeln möchtest und setze dir bedeutungsvolle Ziele.",
    icon: Star,
  },
  {
    title: "Keystone Habits",
    description:
      "Identifiziere die wichtigsten Gewohnheiten, die den größten positiven Einfluss auf dein Leben haben werden.",
    icon: Heart,
  },
  {
    title: "Commitment & Start",
    description:
      "Setze dein Commitment und starte deine Transformationsreise.",
    icon: Coffee,
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

  const Icon = steps[currentStep].icon;

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="p-6 space-y-6 animate-fade-in bg-white/80 backdrop-blur-sm border border-purple-100">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <Icon className="w-6 h-6 text-purple-600" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-purple-800">
              {steps[currentStep].title}
            </h2>
            <p className="text-purple-600">{steps[currentStep].description}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? "bg-purple-600" : "bg-purple-200"
                }`}
              />
            ))}
          </div>
          <Button 
            onClick={handleNext}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {currentStep < steps.length - 1 ? "Weiter" : "Start"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
