import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const questions = [
  {
    question: "Wie würdest du deinen idealen Morgen beschreiben?",
    options: [
      "Früh aufstehen und aktiv sein",
      "Langsam und entspannt starten",
      "Flexibel je nach Tagesplan",
    ],
  },
  {
    question: "Wie gehst du am besten neue Herausforderungen an?",
    options: [
      "Strukturiert mit klarem Plan",
      "Spontan und intuitiv",
      "Mit Unterstützung von anderen",
    ],
  },
  {
    question: "Was motiviert dich am meisten?",
    options: [
      "Persönliche Entwicklung",
      "Konkrete Ziele erreichen",
      "Anderen helfen",
    ],
  },
];

export const PersonalityQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12">
      <Card className="p-6 space-y-6 animate-fade-in">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">
            {questions[currentQuestion].question}
          </h2>
          <RadioGroup
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </Card>
    </div>
  );
};