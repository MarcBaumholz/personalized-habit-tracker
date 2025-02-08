
import { Settings2, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolkitCardActionsProps {
  id?: string;
  onRemove?: (id: string) => void;
  onSelect?: (toolkit: any) => void;
  toolkit: any;
}

export const ToolkitCardActions = ({ id, onRemove, onSelect, toolkit }: ToolkitCardActionsProps) => {
  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      {id && (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove?.(id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4 text-gray-600 hover:text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Routine löschen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(toolkit);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Settings2 className="h-4 w-4 text-gray-600 hover:text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Einstellungen anpassen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <div className="flex items-center gap-1 text-sm text-gray-600 bg-white/80 px-2 py-1 rounded-full">
        <Users className="h-4 w-4" />
        <span>2.9k</span>
      </div>
    </div>
  );
};
