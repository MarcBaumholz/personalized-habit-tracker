import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const INTERVIEW_QUESTIONS = [
  {
    key: "motivation",
    question: "Was ist deine tiefere Motivation für persönliches Wachstum?",
  },
  {
    key: "challenges",
    question: "Welche Hindernisse haben dich bisher davon abgehalten, deine Gewohnheiten zu ändern?",
  },
  {
    key: "beliefs",
    question: "Welche Überzeugungen möchtest du über dich selbst entwickeln?",
  },
  {
    key: "keystone_habits",
    question: "Warum hast du dich für Deep Work und Meditation als Schlüsselgewohnheiten entschieden?",
  },
  {
    key: "implementation",
    question: "Was sind deine größten Bedenken bei der Umsetzung dieser Gewohnheiten?",
  },
];

export const DeepInterview = ({ onComplete }: { onComplete: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleNext = async () => {
    const currentAnswer = answers[INTERVIEW_QUESTIONS[currentQuestion].key];
    if (!currentAnswer?.trim()) {
      toast({
        title: "Antwort erforderlich",
        description: "Bitte beantworte die Frage, um fortzufahren.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await supabase.from("onboarding_responses").insert({
        user_id: user.id,
        question_key: INTERVIEW_QUESTIONS[currentQuestion].key,
        response: currentAnswer,
      });

      if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        onComplete();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Antwort konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Frage {currentQuestion + 1} von {INTERVIEW_QUESTIONS.length}
          </h2>
          <p className="text-lg">{INTERVIEW_QUESTIONS[currentQuestion].question}</p>
        </div>

        <Textarea
          value={answers[INTERVIEW_QUESTIONS[currentQuestion].key] || ""}
          onChange={(e) =>
            setAnswers({
              ...answers,
              [INTERVIEW_QUESTIONS[currentQuestion].key]: e.target.value,
            })
          }
          placeholder="Deine Antwort..."
          className="h-32"
        />

        <Button onClick={handleNext} className="w-full">
          {currentQuestion < INTERVIEW_QUESTIONS.length - 1 ? "Weiter" : "Abschließen"}
        </Button>
      </div>
    </Card>
  );
};