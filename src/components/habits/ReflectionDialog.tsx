import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ReflectionQuestions } from "./ReflectionQuestions";

interface ReflectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  responses: Record<number, string>;
  onResponseChange: (index: number, value: string) => void;
  reflection: string;
  onReflectionChange: (value: string) => void;
  onSubmit: () => void;
}

export const ReflectionDialog = ({
  isOpen,
  onClose,
  questions,
  responses,
  onResponseChange,
  reflection,
  onReflectionChange,
  onSubmit,
}: ReflectionDialogProps) => {
  const { data: customQuestions } = useQuery({
    queryKey: ["reflection-questions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("reflection_questions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      return data || [];
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>SRHI - Self-Report Habit Index</DialogTitle>
          <DialogDescription>
            Bewerte deine Gewohnheit anhand der folgenden Aussagen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <Label>{question}</Label>
              <RadioGroup
                value={responses[index]}
                onValueChange={(value) => onResponseChange(index, value)}
              >
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id={`q${index}-1`} />
                    <Label htmlFor={`q${index}-1`}>Stimme nicht zu</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id={`q${index}-2`} />
                    <Label htmlFor={`q${index}-2`}>Neutral</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id={`q${index}-3`} />
                    <Label htmlFor={`q${index}-3`}>Stimme zu</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          ))}

          {customQuestions?.map((q: any) => (
            <div key={q.id} className="space-y-2">
              <Label>{q.question}</Label>
              <Textarea
                placeholder="Deine Antwort..."
                className="h-20"
                onChange={(e) => onReflectionChange(e.target.value)}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label>Persönliche Reflexionsfragen</Label>
            <ReflectionQuestions />
          </div>

          <Textarea
            value={reflection}
            onChange={(e) => onReflectionChange(e.target.value)}
            placeholder="Teile deine Gedanken..."
            className="h-32"
          />
          <Button onClick={onSubmit} className="w-full">
            Reflexion abschließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};