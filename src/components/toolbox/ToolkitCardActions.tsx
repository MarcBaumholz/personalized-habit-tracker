
import { Settings2, Trash2, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ToolkitCardActionsProps {
  id?: string;
  onRemove?: (id: string) => void;
  onSelect?: (toolkit: any) => void;
  onToggleFavorite?: (toolkit: any) => void;
  isFavorite?: boolean;
  toolkit: any;
  usageCount?: number;
}

export const ToolkitCardActions = ({ 
  id, 
  onRemove, 
  onSelect, 
  onToggleFavorite,
  isFavorite, 
  toolkit,
  usageCount = 0
}: ToolkitCardActionsProps) => {
  return (
    <div className="absolute top-6 right-6 flex items-center gap-3">
      {id && (
        <div className="flex items-center gap-3">
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
                  className="h-10 w-10 p-0 hover:bg-red-50 bg-white"
                >
                  <Trash2 className="h-5 w-5 text-gray-600 hover:text-red-600" />
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
                  className="h-10 w-10 p-0 hover:bg-blue-50 bg-white"
                >
                  <Settings2 className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Einstellungen anpassen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onToggleFavorite && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(toolkit);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-yellow-50 bg-white"
                  >
                    <Star 
                      className={`h-5 w-5 ${isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'} hover:text-yellow-600`} 
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-2 text-base bg-white/90 px-4 py-2 rounded-full shadow-sm border border-gray-200">
        <Users className="h-5 w-5 text-blue-600" />
        <span className="font-medium text-gray-700">{usageCount || '2.9k'}</span>
      </div>
    </div>
  );
};
