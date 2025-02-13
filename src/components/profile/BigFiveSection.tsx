
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EditDialog } from "@/components/profile/EditDialog";
import { PersonalityQuiz } from "@/components/onboarding/PersonalityQuiz";
import { useQueryClient } from "@tanstack/react-query";

interface BigFiveResult {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  pdf_url?: string;
}

interface BigFiveSectionProps {
  results: BigFiveResult | null;
}

export const BigFiveSection = ({ results }: BigFiveSectionProps) => {
  const queryClient = useQueryClient();

  const getPersonalityTraitLabel = (trait: string) => {
    const labels: Record<string, string> = {
      openness: "Offenheit für Erfahrungen",
      conscientiousness: "Gewissenhaftigkeit",
      extraversion: "Extraversion",
      agreeableness: "Verträglichkeit",
      neuroticism: "Neurotizismus",
    };
    return labels[trait] || trait;
  };

  return (
    <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800">Big Five Persönlichkeitstest</h2>
        <EditDialog title="Persönlichkeitstest wiederholen">
          <PersonalityQuiz onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["big-five-results"] });
          }} />
        </EditDialog>
      </div>
      <div className="space-y-4">
        {results ? (
          <div className="space-y-4">
            {Object.entries(results)
              .filter(([key]) => ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"].includes(key))
              .map(([trait, score]) => (
                <div key={trait} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">{getPersonalityTraitLabel(trait)}</span>
                    <span className="text-sm text-blue-600">{Math.round(score as number)}%</span>
                  </div>
                  <Progress value={score as number} className="h-2" />
                </div>
              ))}
            {results.pdf_url && (
              <div className="mt-4">
                <a
                  href={results.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm underline"
                >
                  Detaillierte Ergebnisse anzeigen (PDF)
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="text-blue-600">Noch keine Testergebnisse vorhanden.</p>
        )}
      </div>
    </Card>
  );
};
