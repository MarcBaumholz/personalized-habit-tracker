
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface UserLifeAreasSectionProps {
  lifeAreas: (string | null)[];
}

export const UserLifeAreasSection = ({ lifeAreas }: UserLifeAreasSectionProps) => {
  return (
    <Card className="p-6 bg-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Aktive Lebensbereiche</h3>
      
      {lifeAreas.length === 0 ? (
        <p className="text-muted-foreground">Keine aktiven Lebensbereiche.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {lifeAreas.map((area, index) => 
            area && (
              <Badge 
                key={index} 
                className="px-3 py-1 bg-blue-100 text-blue-800 border-none"
              >
                {area}
              </Badge>
            )
          )}
        </div>
      )}
    </Card>
  );
};
