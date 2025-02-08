
import { Calendar, Plus, Users, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolkitCardProps {
  toolkit: {
    id?: string;
    title: string;
    name?: string;
    description: string;
    category?: string;
    icon: LucideIcon;
    example?: string;
    steps?: string[];
  };
  onSelect?: (toolkit: any) => void;
  onRemove?: (id: string) => void;
  onAdd?: (toolkit: any) => void;
}

export const ToolkitCard = ({ toolkit, onSelect, onRemove, onAdd }: ToolkitCardProps) => {
  const Icon = toolkit.icon || Calendar;
  const randomGradient = [
    "from-purple-200 to-purple-100",
    "from-blue-200 to-blue-100",
    "from-pink-200 to-pink-100",
    "from-indigo-200 to-indigo-100",
  ][Math.floor(Math.random() * 4)];

  return (
    <div 
      onClick={() => onSelect?.(toolkit)}
      className={cn(
        "group relative h-[380px] rounded-3xl p-6 cursor-pointer transition-all duration-300",
        "bg-gradient-to-br",
        randomGradient,
        "hover:shadow-lg hover:-translate-y-1"
      )}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {toolkit.id && (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove?.(toolkit.id!);
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

      <ScrollArea className="h-[280px] pr-4">
        <div className="mt-12 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 text-sm font-medium text-gray-700">
            <Icon className="h-4 w-4" />
            <span>{toolkit.category || "INSPIRATION"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-gray-900">
            {toolkit.name || toolkit.title}
          </h3>
          <p className="text-gray-600 text-sm">
            {toolkit.description}
          </p>
        </div>

        {toolkit.example && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 font-medium">Beispiel:</p>
            <p className="text-sm text-gray-600">{toolkit.example}</p>
          </div>
        )}

        {toolkit.steps && toolkit.steps.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 font-medium">Schritte:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside">
              {toolkit.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </ScrollArea>

      <div className="absolute bottom-6 left-6 right-6">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.(toolkit);
          }}
          className="w-full bg-white hover:bg-gray-50 text-gray-900 gap-2 shadow-sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          {toolkit.id ? 'Bearbeiten' : 'Hinzufügen'}
        </Button>
      </div>
    </div>
  );
};
