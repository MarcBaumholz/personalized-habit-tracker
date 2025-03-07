
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

  const getTraitColor = (trait: string, value: number) => {
    const colors: Record<string, string> = {
      openness: "bg-indigo-500",
      conscientiousness: "bg-green-500",
      extraversion: "bg-yellow-500",
      agreeableness: "bg-blue-500",
      neuroticism: "bg-red-500",
    };
    return colors[trait] || "bg-blue-500";
  };

  return (
    <Card className="p-6 bg-white rounded-2xl shadow-sm border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-800">Big Five Persönlichkeitstest</h2>
        <EditDialog title="Persönlichkeitstest wiederholen">
          <PersonalityQuiz onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["big-five-results"] });
          }} />
        </EditDialog>
      </div>
      <div className="space-y-6">
        {results ? (
          <div className="space-y-6">
            {Object.entries(results)
              .filter(([key]) => ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"].includes(key))
              .map(([trait, score]) => (
                <div key={trait} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">{getPersonalityTraitLabel(trait)}</span>
                    <span className="text-sm font-semibold text-gray-700">{Math.round(score as number)}%</span>
                  </div>
                  <div className="relative h-2 w-full bg-gray-100 rounded overflow-hidden">
                    <div 
                      className={`absolute h-full transition-all ${getTraitColor(trait, score as number)}`} 
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {trait === "openness" && "Kreativität, Neugierde und Offenheit für neue Erfahrungen"}
                    {trait === "conscientiousness" && "Organisation, Zuverlässigkeit und Selbstdisziplin"}
                    {trait === "extraversion" && "Geselligkeit, Enthusiasmus und Energie im sozialen Umfeld"}
                    {trait === "agreeableness" && "Mitgefühl, Kooperation und Rücksichtnahme"}
                    {trait === "neuroticism" && "Emotionale Reaktivität und Tendenz zu negativen Emotionen"}
                  </p>
                </div>
              ))}
            {results.pdf_url && (
              <div className="mt-6 text-center">
                <a
                  href={results.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  Detaillierte Ergebnisse anzeigen (PDF)
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-blue-600 mb-4">Noch keine Testergebnisse vorhanden.</p>
            <EditDialog title="Persönlichkeitstest starten">
              <PersonalityQuiz onComplete={() => {
                queryClient.invalidateQueries({ queryKey: ["big-five-results"] });
              }} />
            </EditDialog>
          </div>
        )}
      </div>
    </Card>
  );
};
