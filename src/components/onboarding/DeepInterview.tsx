
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Star, Heart, Lightbulb, Rocket } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const INTERVIEW_QUESTIONS = [
  {
    key: "motivation",
    question: "Was motiviert dich, gesunde Gewohnheiten zu entwickeln?",
    description: "Welche Dinge treiben dich an? Was möchtest du in deinem Leben verändern?",
    icon: Brain,
  },
  {
    key: "curiosities",
    question: "Was macht dich neugierig auf Veränderung?",
    description: "Welche 2-3 Aspekte deines Lebens möchtest du am meisten erforschen und verbessern?",
    icon: Lightbulb,
  },
  {
    key: "pain_points",
    question: "Welche Herausforderungen hast du bisher erlebt?",
    description: "Beschreibe die Hürden, die dich von deinen Zielen abgehalten haben.",
    icon: Heart,
  },
  {
    key: "values",
    question: "Welche Werte und Normen möchtest du dir aneignen?",
    description: "Denke darüber nach, welche Prinzipien dein zukünftiges Ich leiten sollen.",
    icon: Star,
  },
  {
    key: "current_habits",
    question: "Welche Gewohnheiten prägen deinen aktuellen Alltag?",
    description: "Liste sowohl positive als auch negative Gewohnheiten auf, die du bereits hast.",
    icon: Rocket,
  },
];

export const DeepInterview = ({ onComplete }: { onComplete: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saving" | "saved" | "error" | null>(null);
  const { toast } = useToast();

  const saveAnswer = async (questionKey: string, answer: string) => {
    try {
      setAutoSaveStatus("saving");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await supabase.from("onboarding_responses").insert({
        user_id: user.id,
        question_key: questionKey,
        response: answer,
      });

      setAutoSaveStatus("saved");
    } catch (error) {
      setAutoSaveStatus("error");
      toast({
        title: "Fehler beim Speichern",
        description: "Deine Antwort konnte nicht automatisch gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const currentAnswer = answers[INTERVIEW_QUESTIONS[currentQuestion].key];
    if (currentAnswer?.trim()) {
      const debounceTimer = setTimeout(() => {
        saveAnswer(INTERVIEW_QUESTIONS[currentQuestion].key, currentAnswer);
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [answers, currentQuestion]);

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

    if (currentQuestion < INTERVIEW_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete();
    }
  };

  const CurrentIcon = INTERVIEW_QUESTIONS[currentQuestion].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <Card className="max-w-2xl mx-auto p-6 bg-white/90 backdrop-blur-sm border border-blue-100">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <CurrentIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">
                Frage {currentQuestion + 1} von {INTERVIEW_QUESTIONS.length}
              </h2>
              <Progress 
                value={(currentQuestion + 1) * (100 / INTERVIEW_QUESTIONS.length)} 
                className="h-1 mt-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-blue-800">
              {INTERVIEW_QUESTIONS[currentQuestion].question}
            </h3>
            <p className="text-blue-600">
              {INTERVIEW_QUESTIONS[currentQuestion].description}
            </p>
          </div>

          <Textarea
            value={answers[INTERVIEW_QUESTIONS[currentQuestion].key] || ""}
            onChange={(e) => {
              setAnswers({
                ...answers,
                [INTERVIEW_QUESTIONS[currentQuestion].key]: e.target.value,
              });
            }}
            placeholder="Deine Antwort..."
            className="h-32 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {autoSaveStatus === "saving" && (
                <span className="text-blue-600">Wird gespeichert...</span>
              )}
              {autoSaveStatus === "saved" && (
                <span className="text-green-600">Gespeichert</span>
              )}
              {autoSaveStatus === "error" && (
                <span className="text-red-600">Fehler beim Speichern</span>
              )}
            </div>
            <Button 
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentQuestion < INTERVIEW_QUESTIONS.length - 1 ? "Weiter" : "Abschließen"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
