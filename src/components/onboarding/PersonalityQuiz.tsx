
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

const BIG_FIVE_QUESTIONS = [
  {
    category: "openness",
    questions: [
      "Ich bin offen für neue Erfahrungen",
      "Ich bin kreativ und habe viele Ideen",
      "Ich interessiere mich für abstrakte Konzepte",
    ],
  },
  {
    category: "conscientiousness",
    questions: [
      "Ich plane sorgfältig und halte mich an Pläne",
      "Ich achte auf Details",
      "Ich bin organisiert und ordentlich",
    ],
  },
  {
    category: "extraversion",
    questions: [
      "Ich gehe gerne auf andere Menschen zu",
      "Ich fühle mich in Gruppen wohl",
      "Ich bin gesprächig und kontaktfreudig",
    ],
  },
  {
    category: "agreeableness",
    questions: [
      "Ich bin hilfsbereit und selbstlos",
      "Ich vertraue anderen Menschen",
      "Ich bin einfühlsam und warmherzig",
    ],
  },
  {
    category: "neuroticism",
    questions: [
      "Ich mache mir oft Sorgen",
      "Ich werde leicht nervös und unsicher",
      "Ich reagiere empfindlich auf Stress",
    ],
  },
];

export const PersonalityQuiz = ({ onComplete }: { onComplete: () => void }) => {
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleAnswer = (category: string, questionIndex: number, value: string) => {
    setAnswers({
      ...answers,
      [category]: { ...(answers[category] || {}), [questionIndex]: value },
    });
  };

  const calculateScores = () => {
    const scores: Record<string, number> = {};
    
    Object.entries(answers).forEach(([category, categoryAnswers]) => {
      const sum = Object.values(categoryAnswers).reduce((acc, value) => acc + parseInt(value), 0);
      scores[category] = (sum / (3 * 5)) * 100; // Normalize to 0-100 scale
    });
    
    return scores;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let pdfUrl = null;
      if (pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('personality_assessments')
          .upload(fileName, pdfFile);

        if (uploadError) throw uploadError;
        
        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('personality_assessments')
            .getPublicUrl(fileName);
          
          pdfUrl = publicUrl;
        }
      }

      const scores = calculateScores();
      
      const { error } = await supabase.from("big_five_results").insert({
        user_id: user.id,
        openness: scores.openness,
        conscientiousness: scores.conscientiousness,
        extraversion: scores.extraversion,
        agreeableness: scores.agreeableness,
        neuroticism: scores.neuroticism,
        pdf_url: pdfUrl,
      });

      if (error) throw error;

      toast({
        title: "Test abgeschlossen",
        description: "Deine Persönlichkeitsanalyse wurde erfolgreich gespeichert",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Antworten konnten nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const isComplete = Object.values(answers).every(
    categoryAnswers => Object.keys(categoryAnswers).length === 3
  );

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6 bg-white/80 backdrop-blur-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-blue-800">Big Five Persönlichkeitstest</h2>
        <p className="text-blue-600">
          Beantworte die folgenden Fragen, um dein Persönlichkeitsprofil zu erstellen
        </p>
      </div>

      {BIG_FIVE_QUESTIONS.map((category) => (
        <div key={category.category} className="space-y-4 p-4 border rounded-lg bg-blue-50">
          <h3 className="font-semibold text-blue-800 capitalize">
            {category.category}
          </h3>
          
          {category.questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <Label>{question}</Label>
              <RadioGroup
                value={answers[category.category]?.[index]}
                onValueChange={(value) => handleAnswer(category.category, index, value)}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value.toString()} id={`${category.category}-${index}-${value}`} />
                    <Label htmlFor={`${category.category}-${index}-${value}`}>{value}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
      ))}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Alternativ: PDF hochladen</Label>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="bg-white"
          />
          <p className="text-sm text-blue-600">
            Falls du bereits einen Big Five Test gemacht hast, kannst du hier das Ergebnis als PDF hochladen
          </p>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isComplete && !pdfFile}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Persönlichkeitstest abschließen
      </Button>
    </Card>
  );
};
