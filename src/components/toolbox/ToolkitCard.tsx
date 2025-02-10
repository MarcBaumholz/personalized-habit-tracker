
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

  return (
    <div 
      onClick={() => onSelect?.(toolkit)}
      className={cn(
        "group relative h-[320px] w-full rounded-xl p-6",
        "cursor-pointer transition-all duration-300",
        "bg-white hover:bg-gray-50",
        "shadow-sm hover:shadow-lg hover:-translate-y-1",
        "border border-gray-200"
      )}
    >
      <ToolkitCardActions
        id={toolkit.id}
        onRemove={onRemove}
        onSelect={onSelect}
        toolkit={toolkit}
      />

      <ScrollArea className="h-[220px] pr-4">
        <div className="mt-10 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-sm font-medium text-blue-700 border border-blue-100">
            <Icon className="h-4 w-4 text-blue-600" />
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
            <p className="text-sm font-medium text-gray-900">Beispiel:</p>
            <p className="text-sm text-gray-600 leading-relaxed mt-1">{toolkit.example}</p>
          </div>
        )}

        {toolkit.steps && toolkit.steps.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">Schritte:</p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1.5 mt-1">
              {toolkit.steps.map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li>
              ))}
            </ul>
          </div>
        )}
      </ScrollArea>

      <div className="absolute bottom-4 left-4 right-4">
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onAdd?.(toolkit);
          }}
          className={cn(
            "w-full gap-2",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "shadow-sm hover:shadow-md",
            "transition-all duration-200",
            "text-sm font-medium py-5"
          )}
        >
          <Plus className="h-4 w-4" />
          {toolkit.id ? "Bearbeiten" : "Hinzufügen"}
        </Button>
      </div>
    </div>
  );
};
