
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Info, Award, CheckCircle2, Lightbulb, Flag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitFormationTrackerProps {
  streak: number;
  habitName: string;
  className?: string;
}

export const HabitFormationTracker = ({ streak, habitName, className }: HabitFormationTrackerProps) => {
  // Calculate progress percentage (out of 66 days)
  const progressPercentage = Math.min(Math.round((streak / 66) * 100), 100);
  
  // Calculate the current day based on streak
  const currentDay = Math.max(1, streak);
  const remainingDays = Math.max(0, 66 - currentDay);
  
  // Determine which phase the habit is in
  const phase = currentDay <= 30 
    ? "motivational" 
    : currentDay <= 66 
      ? "volitional" 
      : "habitual";
  
  // Determine colors based on the current phase
  const phaseColors = {
    motivational: {
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      progressColor: "bg-blue-500"
    },
    volitional: {
      bgColor: "bg-amber-50",
      textColor: "text-amber-800",
      progressColor: "bg-amber-500"
    },
    habitual: {
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      progressColor: "bg-green-500"
    }
  };
  
  const currentColors = phaseColors[phase];
  
  // Helper to calculate position for phase markers
  const getMarkerPosition = (dayNumber: number) => {
    return `left-[${Math.min((dayNumber / 66) * 100, 100)}%]`;
  };

  const getPhaseName = (phase: string) => {
    switch(phase) {
      case 'motivational': return 'Motivationsphase';
      case 'volitional': return 'Willensphase';
      case 'habitual': return 'Habitualisierungsphase';
      default: return '';
    }
  };

  const getPhaseDescription = (phase: string) => {
    switch(phase) {
      case 'motivational': 
        return 'In dieser Phase (Tag 0-30) brauchst du noch viel Unterstützung. Nutze Trigger und externe Belohnungen.';
      case 'volitional': 
        return 'In dieser Phase (Tag 31-66) reduzierst du externe Hinweise und übernimmst mehr Eigenverantwortung.';
      case 'habitual': 
        return 'Ab Tag 67 ist dein Verhalten automatisiert! Die Gewohnheit ist nun Teil deiner Identität.';
      default: return '';
    }
  };

  return (
    <Card className={cn("shadow-sm border", currentColors.bgColor, className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className={cn("text-lg", currentColors.textColor)}>
            66-Tage Gewohnheitsbildung
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Wissenschaftliche Studien zeigen, dass es durchschnittlich 66 Tage dauert, um eine Gewohnheit zu etablieren. Dieser Prozess verläuft in drei Phasen.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tag {currentDay} von 66</span>
            <span>{progressPercentage}%</span>
          </div>
          
          <div className="relative">
            <Progress value={progressPercentage} className="h-3" 
              style={{ 
                "--progress-background": currentColors.progressColor.replace("bg-", "var(--")+")",
              } as React.CSSProperties}
            />
            
            {/* Phase markers */}
            <div className="absolute top-0 left-[45.5%] h-3 border-l border-dotted border-gray-400"></div>
            <div className="absolute top-0 left-[100%] h-3 border-l border-dotted border-gray-400"></div>
            
            {/* Current day marker */}
            <div 
              className="absolute top-0 h-3 w-1 bg-black z-10" 
              style={{ left: `${Math.min(progressPercentage, 100)}%` }}
              title={`Aktueller Tag: ${currentDay}`}
            />
            
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>Tag 1</span>
              <span>Tag 30</span>
              <span>Tag 66</span>
            </div>
          </div>
        </div>
        
        <div className={cn("p-3 rounded-lg border", 
          phase === "motivational" ? "bg-blue-100 border-blue-200" : 
          phase === "volitional" ? "bg-amber-100 border-amber-200" : 
          "bg-green-100 border-green-200"
        )}>
          <div className="flex">
            {phase === "motivational" && <Lightbulb className="h-5 w-5 mr-2 text-blue-700" />}
            {phase === "volitional" && <Flag className="h-5 w-5 mr-2 text-amber-700" />}
            {phase === "habitual" && <Award className="h-5 w-5 mr-2 text-green-700" />}
            
            <div>
              <h3 className={cn("font-medium text-sm",
                phase === "motivational" ? "text-blue-700" : 
                phase === "volitional" ? "text-amber-700" : 
                "text-green-700"
              )}>
                {getPhaseName(phase)}
              </h3>
              <p className="text-xs mt-1 text-gray-600">
                {getPhaseDescription(phase)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          {currentDay >= 66 ? (
            <div className="flex items-center justify-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Gratulation! {habitName} ist jetzt eine etablierte Gewohnheit.</span>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Noch {remainingDays} Tage bis zur vollständigen Gewohnheitsbildung.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
