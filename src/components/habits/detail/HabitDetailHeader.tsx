
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HabitDetailHeaderProps {
  habitName: string;
  progress: number;
}

export const HabitDetailHeader = ({ habitName, progress }: HabitDetailHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button 
        onClick={() => navigate(-1)} 
        variant="ghost" 
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück
      </Button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{habitName}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Progress value={progress} className="h-2 flex-1" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      </div>
    </>
  );
};
