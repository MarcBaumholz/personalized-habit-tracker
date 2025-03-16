
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, ChevronLeft, Info, Award, CheckCircle2, Lightbulb, Flag, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HabitDetailHeaderProps {
  habitName: string;
  progress: number;
  streak: number;
  habitId?: string;
}

export const HabitDetailHeader = ({ habitName, progress, streak, habitId }: HabitDetailHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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

  const createHabitScheduleMutation = useMutation({
    mutationFn: async ({ date, time }: { date: string, time: string }) => {
      if (!habitId) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_schedules")
        .insert({
          user_id: user.id,
          habit_id: habitId,
          scheduled_date: date,
          scheduled_time: time,
          position_x: 5,
          position_y: 5
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-schedules"] });
      toast({
        title: "Gewohnheit eingeplant",
        description: "Die Gewohnheit wurde erfolgreich zum Kalender hinzugefügt.",
      });
    },
  });

  const handleAddToCalendar = (date: string, time: string) => {
    createHabitScheduleMutation.mutate({ date, time });
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Zum Kalender hinzufügen</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b bg-blue-50">
              <h3 className="font-medium">Wann möchtest du diese Gewohnheit planen?</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Datum</label>
                  <input 
                    type="date" 
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                    defaultValue={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Uhrzeit</label>
                  <input 
                    type="time" 
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                    defaultValue="08:00"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddToCalendar(
                    format(new Date(), "yyyy-MM-dd"),
                    "08:00"
                  )}
                >
                  <span>Morgen</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddToCalendar(
                    format(new Date(), "yyyy-MM-dd"),
                    "12:00"
                  )}
                >
                  <span>Mittag</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddToCalendar(
                    format(new Date(), "yyyy-MM-dd"),
                    "18:00"
                  )}
                >
                  <span>Abend</span>
                </Button>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => {
                  const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement;
                  const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
                  
                  if (dateInput && timeInput) {
                    handleAddToCalendar(dateInput.value, timeInput.value);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Zum Kalender hinzufügen
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Zur Kalenderansicht
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
