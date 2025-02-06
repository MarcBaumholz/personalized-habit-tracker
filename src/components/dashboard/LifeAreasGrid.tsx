import { Card } from "@/components/ui/card";

const LIFE_AREAS = [
  { id: 1, name: "Gesundheit", color: "#F97316" },
  { id: 2, name: "Beziehungen", color: "#D946EF" },
  { id: 3, name: "Karriere", color: "#0EA5E9" },
  { id: 4, name: "Finanzen", color: "#8B5CF6" },
  { id: 5, name: "Persönlichkeit", color: "#F97316" },
  { id: 6, name: "Freizeit", color: "#D946EF" },
  { id: 7, name: "Spiritualität", color: "#0EA5E9" },
  { id: 8, name: "Umwelt", color: "#8B5CF6" },
];

export const LifeAreasGrid = () => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Lebensbereiche</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {LIFE_AREAS.map((area) => (
          <div
            key={area.id}
            className="aspect-square rounded-lg p-4 flex items-center justify-center text-white font-medium text-center cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: area.color }}
          >
            {area.name}
          </div>
        ))}
      </div>
    </Card>
  );
};