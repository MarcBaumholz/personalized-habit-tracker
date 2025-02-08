
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
    "from-purple-200 to-purple-100",
    "from-blue-200 to-blue-100",
    "from-pink-200 to-pink-100",
    "from-indigo-200 to-indigo-100",
  ][Math.floor(Math.random() * 4)];

  return (
    <div 
      onClick={() => onSelect?.(toolkit)}
      className={cn(
        "group relative h-[280px] w-full rounded-3xl p-6 cursor-pointer transition-all duration-300",
        "bg-gradient-to-br",
        randomGradient,
        "hover:shadow-lg hover:-translate-y-1"
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 text-sm font-medium text-gray-700">
            <Icon className="h-4 w-4" />
            <span>{toolkit.category || "INSPIRATION"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {toolkit.name || toolkit.title}
          </h3>
          <p className="text-sm text-gray-600">
            {toolkit.description}
          </p>
        </div>

        {toolkit.example && (
          <div className="mt-3">
            <p className="text-sm text-gray-700 font-medium">Beispiel:</p>
            <p className="text-sm text-gray-600">{toolkit.example}</p>
          </div>
        )}

        {toolkit.steps && toolkit.steps.length > 0 && (
          <div className="mt-3">
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
          className="w-full bg-white hover:bg-gray-50 text-gray-900 gap-2 shadow-sm text-sm py-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          {toolkit.id ? 'Bearbeiten' : 'Hinzufügen'}
        </Button>
      </div>
    </div>
  );
};
