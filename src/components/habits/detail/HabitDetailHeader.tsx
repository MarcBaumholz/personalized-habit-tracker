
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, ChevronLeft, Info, Award, CheckCircle2, Lightbulb, Flag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitDetailHeaderProps {
  habitName: string;
  progress: number;
  streak: number;
}

export const HabitDetailHeader = ({ habitName, progress, streak }: HabitDetailHeaderProps) => {
  const navigate = useNavigate();
  
  // Determine which phase the habit is in
  const phase = streak <= 30 
    ? "motivational" 
    : streak <= 66 
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
  
  const getPhaseName = (phase: string) => {
    switch(phase) {
      case 'motivational': return 'Motivationsphase';
      case 'volitional': return 'Willensphase';
      case 'habitual': return 'Habitualisierungsphase';
      default: return '';
    }
  };

  return (
    <div className="mb-8">
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 pl-0"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Zurück zur Übersicht
      </Button>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
          {habitName}
        </h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Zum Kalender hinzufügen</span>
        </Button>
      </div>
      
      <div className={cn("p-4 rounded-lg mb-4", currentColors.bgColor)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {phase === "motivational" && <Lightbulb className="h-5 w-5 text-blue-700" />}
            {phase === "volitional" && <Flag className="h-5 w-5 text-amber-700" />}
            {phase === "habitual" && <Award className="h-5 w-5 text-green-700" />}
            <h3 className={cn("font-medium", currentColors.textColor)}>
              66-Tage Gewohnheitsbildung: {getPhaseName(phase)}
            </h3>
          </div>
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

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tag {streak} von 66</span>
            <span>{progress}% komplett</span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progress} 
              className="h-3"
              style={{ 
                "--progress-background": currentColors.progressColor.replace("bg-", "var(--")+")",
              } as React.CSSProperties}
            />
            
            {/* Phase markers */}
            <div className="absolute top-0 left-[45.5%] h-3 border-l border-dotted border-gray-400"></div>
            <div className="absolute top-0 left-[100%] h-3 border-l border-dotted border-gray-400"></div>
            
            <div className="flex justify-between mt-1 text-xs text-gray-600">
              <span>Tag 1</span>
              <span>Tag 30</span>
              <span>Tag 66</span>
            </div>
          </div>
        </div>
        
        {streak >= 66 ? (
          <div className="flex items-center justify-center gap-2 text-green-700 mt-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Gratulation! {habitName} ist jetzt eine etablierte Gewohnheit.</span>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mt-2">
            Noch {66 - streak} Tage bis zur vollständigen Gewohnheitsbildung.
          </p>
        )}
      </div>
    </div>
  );
};
