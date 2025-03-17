
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  CircleDashed,
  BellDot,
  Pencil,
  Trash2,
  Settings,
  Calendar,
  MinusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HabitControlsProps {
  habit: any;
  elasticLevel: string;
  onUpdateElasticLevel: (level: string) => void;
  onShowEmotionTracker: (show: boolean) => void;
  showEmotionTracker: boolean;
  onShowHabitLoop: (show: boolean) => void;
  showHabitLoop: boolean;
  onReflect: () => void;
  needsReflection: boolean;
  lastReflection: any;
  onDelete: () => void;
}

export const HabitControls = ({
  habit,
  elasticLevel,
  onUpdateElasticLevel,
  onShowEmotionTracker,
  showEmotionTracker,
  onShowHabitLoop,
  showHabitLoop,
  onReflect,
  needsReflection,
  lastReflection,
  onDelete,
}: HabitControlsProps) => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="flex items-center gap-1">
      {/* Minimal Dose Option - Updated to Circle with Minus symbol */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
              onClick={() => onUpdateElasticLevel(elasticLevel === "minimal" ? "medium" : "minimal")}
            >
              <MinusCircle 
                className={`h-5 w-5 ${elasticLevel === "minimal" ? "fill-amber-100" : ""}`} 
              />
              <span className="sr-only">Minimale Dosis</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Minimale Dosis {elasticLevel === "minimal" ? "(aktiviert)" : ""}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Reflection Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`h-8 w-8 p-0 ${needsReflection ? "text-blue-500 hover:text-blue-600" : "text-gray-400 hover:text-gray-500"}`}
              onClick={onReflect}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Reflektieren</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reflektieren</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Menu Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Mehr Optionen</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Gewohnheitsoptionen</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => onShowEmotionTracker(!showEmotionTracker)}>
            <BellDot className="h-4 w-4 mr-2" />
            <span>Emotionen tracken</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => onShowHabitLoop(!showHabitLoop)}>
            <CircleDashed className="h-4 w-4 mr-2" />
            <span>Habit Loop anzeigen</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Calendar className="h-4 w-4 mr-2" />
            <span>Zeitplan anzeigen</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <Settings className="h-4 w-4 mr-2" />
            <span>Gewohnheit bearbeiten</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600" 
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>Löschen</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
