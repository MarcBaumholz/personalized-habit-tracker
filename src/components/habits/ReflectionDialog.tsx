
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
import { Check, Info, AlertTriangle } from "lucide-react";

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
          <DialogTitle>SRHI - Gewohnheitsindex</DialogTitle>
          <DialogDescription>
            Bewerte deine Gewohnheit und identifiziere Herausforderungen
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Der SRHI hilft dir zu verstehen, wie automatisiert deine Gewohnheit bereits ist. 
                Eine höhere Punktzahl zeigt eine stärkere Gewohnheit.
              </p>
            </div>
          </div>

          {questions.map((question, index) => (
            <div key={index} className="border p-4 rounded-lg bg-gray-50">
              <Label className="font-medium mb-3 block">{question}</Label>
              <RadioGroup
                value={responses[index]}
                onValueChange={(value) => onResponseChange(index, value)}
                className="flex justify-between space-x-2"
              >
                <div className="flex-1 border rounded-md p-2 flex flex-col items-center hover:bg-gray-100">
                  <RadioGroupItem value="1" id={`q${index}-1`} />
                  <Label htmlFor={`q${index}-1`} className="text-xs mt-1">
                    Nein
                  </Label>
                </div>
                <div className="flex-1 border rounded-md p-2 flex flex-col items-center hover:bg-gray-100">
                  <RadioGroupItem value="2" id={`q${index}-2`} />
                  <Label htmlFor={`q${index}-2`} className="text-xs mt-1">
                    Neutral
                  </Label>
                </div>
                <div className="flex-1 border rounded-md p-2 flex flex-col items-center hover:bg-gray-100">
                  <RadioGroupItem value="3" id={`q${index}-3`} />
                  <Label htmlFor={`q${index}-3`} className="text-xs mt-1">
                    Ja
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ))}

          {customQuestions?.map((q: any) => (
            <div key={q.id} className="border p-4 rounded-lg">
              <Label className="font-medium mb-2 block">{q.question}</Label>
              <Textarea
                placeholder="Deine Antwort..."
                className="h-20"
                onChange={(e) => onReflectionChange(e.target.value)}
              />
            </div>
          ))}

          <div className="border p-4 rounded-lg bg-orange-50">
            <div className="flex items-start space-x-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <Label className="font-medium">Herausforderungen & Hindernisse</Label>
            </div>
            <Textarea
              value={reflection}
              onChange={(e) => onReflectionChange(e.target.value)}
              placeholder="Welche Herausforderungen oder Hindernisse hast du bei dieser Gewohnheit erlebt? Was könnte dir helfen, sie zu überwinden?"
              className="h-32"
            />
          </div>

          <Button onClick={onSubmit} className="w-full">
            <Check className="mr-2 h-4 w-4" /> Reflexion abschließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
