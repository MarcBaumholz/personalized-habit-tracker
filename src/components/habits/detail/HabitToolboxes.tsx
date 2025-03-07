
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Package } from "lucide-react";

interface HabitToolboxesProps {
  toolboxes: any[];
}

export const HabitToolboxes = ({ toolboxes }: HabitToolboxesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Toolboxes</span>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Toolbox hinzufügen
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {toolboxes && toolboxes.length > 0 ? (
          <div className="space-y-4">
            {toolboxes.map((toolbox: any) => (
              <div key={toolbox.id} className="p-4 border rounded-lg relative hover:shadow-md transition-shadow">
                <div className="absolute top-3 right-3">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
                <h3 className="font-bold text-blue-700 mb-1">{toolbox.title}</h3>
                <p className="text-sm text-gray-600">{toolbox.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p>Keine Toolboxes hinzugefügt</p>
            <p className="text-sm">Füge Toolboxes hinzu, um deine Gewohnheit zu unterstützen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
