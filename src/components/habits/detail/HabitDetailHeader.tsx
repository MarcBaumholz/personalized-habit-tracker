
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HabitDetailHeaderProps {
  habitName: string;
  progress: number;
}

export const HabitDetailHeader = ({ habitName, progress }: HabitDetailHeaderProps) => {
  const navigate = useNavigate();
  
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
      
      <div className="flex items-center gap-3 mt-2">
        <Progress value={progress} className="h-2 flex-1 bg-gray-100" />
        <span className="text-sm font-medium whitespace-nowrap">{progress}% komplett</span>
      </div>
    </div>
  );
};
