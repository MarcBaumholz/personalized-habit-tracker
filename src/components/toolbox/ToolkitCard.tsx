
import { Calendar, Info, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

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
    <div className="relative p-6 transition-all duration-300 h-[400px] flex flex-col hover:shadow-lg bg-gradient-to-br from-purple-50 to-white border-purple-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
          <Icon className="h-6 w-6 text-purple-700" />
        </div>
        <div>
          <h3 className="text-xl font-medium">{toolkit.name || toolkit.title}</h3>
          <p className="text-sm text-gray-600">
            {toolkit.description || toolkit.category}
          </p>
        </div>
      </div>

      <div className="flex-grow space-y-4">
        {toolkit.example && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-purple-700">Beispiel:</p>
            <p className="text-sm text-gray-600">{toolkit.example}</p>
          </div>
        )}
        
        {toolkit.steps && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-purple-700">Schritte:</p>
            <ul className="list-disc list-inside space-y-1">
              {toolkit.steps.map((step: string, index: number) => (
                <li key={index} className="text-sm text-gray-600">{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 mt-4">
        {toolkit.id && !toolkit.steps && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 hover:bg-purple-50"
              onClick={() => onSelect?.(toolkit)}
            >
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1 hover:bg-red-50 hover:text-red-600"
              onClick={() => onRemove?.(toolkit.id!)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Entfernen
            </Button>
          </div>
        )}
        {!toolkit.id && (
          <Button 
            onClick={() => onAdd?.(toolkit)}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Zu meinen Routinen hinzufügen
          </Button>
        )}
      </div>
    </div>
  );
};
