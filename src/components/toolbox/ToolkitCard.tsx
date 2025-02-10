
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
        "group relative min-h-[500px] w-full rounded-xl p-8",
        "cursor-pointer transition-all duration-300",
        "bg-white hover:bg-blue-50",
        "shadow-md hover:shadow-xl hover:-translate-y-1",
        "border border-gray-200"
      )}
    >
      <ToolkitCardActions
        id={toolkit.id}
        onRemove={onRemove}
        onSelect={onSelect}
        toolkit={toolkit}
      />

      <ScrollArea className="h-[400px] pr-4">
        <div className="mt-8 mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-50 text-base font-medium text-blue-700 border border-blue-100">
            <Icon className="h-5 w-5 text-blue-600" />
            <span>{toolkit.category || "INSPIRATION"}</span>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            {toolkit.name || toolkit.title}
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            {toolkit.description}
          </p>
        </div>

        {toolkit.example && (
          <div className="mt-8">
            <p className="text-lg font-medium text-gray-900 mb-3">Beispiel:</p>
            <p className="text-lg text-gray-600 leading-relaxed">{toolkit.example}</p>
          </div>
        )}

        {toolkit.steps && toolkit.steps.length > 0 && (
          <div className="mt-8">
            <p className="text-lg font-medium text-gray-900 mb-3">Schritte:</p>
            <ul className="text-lg text-gray-600 list-disc list-inside space-y-3">
              {toolkit.steps.map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li>
              ))}
            </ul>
          </div>
        )}
      </ScrollArea>

      <div className="absolute bottom-8 left-8 right-8">
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
            "text-lg font-medium py-7"
          )}
        >
          <Plus className="h-6 w-6" />
          {toolkit.id ? "Bearbeiten" : "Hinzufügen"}
        </Button>
      </div>
    </div>
  );
};
