
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EditDialog } from "@/components/profile/EditDialog";
import { AddReflectionDialog } from "@/components/coaching/AddReflectionDialog";

interface CoachingReflection {
  energy_level: number;
  mood_rating: number;
  challenges: string;
  solutions: string;
  values_alignment: string;
  strengths_used: string[];
}

interface CoachingSectionProps {
  reflection: CoachingReflection | null;
}

export const CoachingSection = ({ reflection }: CoachingSectionProps) => {
  return (
    <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">Coaching Reflexion</h2>
        <EditDialog title="Reflexion bearbeiten">
          <AddReflectionDialog />
        </EditDialog>
      </div>
      <div className="space-y-4">
        {reflection ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-blue-600">Energielevel</p>
                <Progress value={reflection.energy_level * 10} />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-blue-600">Stimmung</p>
                <Progress value={reflection.mood_rating * 10} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-blue-700">Herausforderungen & Lösungen</h3>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{reflection.challenges}</p>
                <p className="text-sm text-blue-600 mt-2">{reflection.solutions}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-blue-700">Werte & Stärken</h3>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">{reflection.values_alignment}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reflection.strengths_used?.map((strength: string) => (
                    <span key={strength} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-blue-600">Noch keine Reflexionen vorhanden.</p>
        )}
      </div>
    </Card>
  );
};
