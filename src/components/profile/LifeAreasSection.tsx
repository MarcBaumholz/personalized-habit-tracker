
import { Card } from "@/components/ui/card";
import { EditDialog } from "@/components/profile/EditDialog";
import { LifeAreasSelection } from "@/components/onboarding/LifeAreasSelection";
import { useQueryClient } from "@tanstack/react-query";

interface LifeAreasSectionProps {
  areas: string[];
}

export const LifeAreasSection = ({ areas }: LifeAreasSectionProps) => {
  const queryClient = useQueryClient();

  const areaDefinitions = {
    health: { name: "Gesundheit", color: "bg-red-100 border-red-200 text-red-700" },
    relationships: { name: "Beziehungen", color: "bg-pink-100 border-pink-200 text-pink-700" },
    career: { name: "Karriere", color: "bg-blue-100 border-blue-200 text-blue-700" },
    finance: { name: "Finanzen", color: "bg-green-100 border-green-200 text-green-700" },
    personal: { name: "Persönlichkeit", color: "bg-purple-100 border-purple-200 text-purple-700" },
    leisure: { name: "Freizeit", color: "bg-yellow-100 border-yellow-200 text-yellow-700" },
    spiritual: { name: "Spiritualität", color: "bg-indigo-100 border-indigo-200 text-indigo-700" },
    environment: { name: "Umwelt", color: "bg-teal-100 border-teal-200 text-teal-700" },
  };

  return (
    <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">Deine ausgewählten Lebensbereiche</h2>
        <EditDialog title="Lebensbereiche bearbeiten">
          <LifeAreasSelection onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["life-areas"] });
          }} />
        </EditDialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {areas?.map((areaId) => {
          const area = areaDefinitions[areaId as keyof typeof areaDefinitions];
          return area ? (
            <div
              key={areaId}
              className={`p-4 rounded-lg border-2 ${area.color}`}
            >
              <span className="font-medium">{area.name}</span>
            </div>
          ) : null;
        })}
      </div>
    </Card>
  );
};
