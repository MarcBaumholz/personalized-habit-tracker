
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolkitCardActions } from "./ToolkitCardActions";

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
    "from-purple-100 to-indigo-50",
    "from-blue-100 to-purple-50",
    "from-indigo-100 to-blue-50",
    "from-violet-100 to-purple-50",
  ][Math.floor(Math.random() * 4)];

  return (
    <div 
      onClick={() => onSelect?.(toolkit)}
      className={cn(
        "group relative h-[280px] w-full rounded-2xl p-6",
        "cursor-pointer transition-all duration-300",
        "bg-gradient-to-br",
        randomGradient,
        "hover:shadow-lg hover:-translate-y-1",
        "border border-white/80"
      )}
    >
      <ToolkitCardActions
        id={toolkit.id}
        onRemove={onRemove}
        onSelect={onSelect}
        toolkit={toolkit}
      />

      <ScrollArea className="h-[180px] pr-4">
        <div className="mt-10 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 text-sm font-medium text-gray-700 shadow-sm border border-purple-100/50">
            <Icon className="h-4 w-4 text-purple-600" />
            <span>{toolkit.category || "INSPIRATION"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {toolkit.name || toolkit.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {toolkit.description}
          </p>
        </div>

        {toolkit.example && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 font-medium">Beispiel:</p>
            <p className="text-sm text-gray-600 leading-relaxed">{toolkit.example}</p>
          </div>
        )}

        {toolkit.steps && toolkit.steps.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-700 font-medium">Schritte:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              {toolkit.steps.map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li>
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
          className={cn(
            "w-full gap-2 shadow-sm text-sm py-2",
            "bg-white hover:bg-gray-50 text-gray-900",
            "border border-purple-100",
            "transition-all duration-200",
            "hover:shadow-md"
          )}
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          {toolkit.id ? 'Bearbeiten' : 'Hinzufügen'}
        </Button>
      </div>
    </div>
  );
};
