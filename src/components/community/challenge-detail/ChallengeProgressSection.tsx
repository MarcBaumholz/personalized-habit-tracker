
import { Progress } from "@/components/ui/progress";

interface ChallengeProgressSectionProps {
  currentProgress: number;
  targetValue: number;
  targetUnit: string;
}

export const ChallengeProgressSection = ({ 
  currentProgress, 
  targetValue, 
  targetUnit 
}: ChallengeProgressSectionProps) => {
  const progressPercentage = Math.min(100, Math.round((currentProgress / targetValue) * 100));
  
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between text-sm">
        <span className="font-medium">Gesamtfortschritt</span>
        <span className="text-blue-700">
          {currentProgress} von {targetValue} {targetUnit}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-3" />
    </div>
  );
};
