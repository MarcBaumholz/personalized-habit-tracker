
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
import { Card, CardContent } from "@/components/ui/card";
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
          <DialogTitle>Schnelle Reflexion</DialogTitle>
          <DialogDescription>
            Identifiziere Hürden und Erfolge bei deiner Gewohnheitsbildung
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-2">
          {/* Simplified Habit Progress Assessment */}
          <Card className="border-blue-100">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Label className="font-medium text-blue-700">Wie ist es dir mit dieser Gewohnheit ergangen?</Label>
                <RadioGroup
                  value={responses[0] || ""}
                  onValueChange={(value) => onResponseChange(0, value)}
                  className="flex justify-between space-x-2"
                >
                  <div className="flex-1 flex flex-col items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="1" id="progress-1" className="sr-only" />
                    <Label htmlFor="progress-1" className="cursor-pointer text-center">
                      <div className="text-red-500 text-xl mb-1">😞</div>
                      <div className="text-xs">Schwierig</div>
                    </Label>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="2" id="progress-2" className="sr-only" />
                    <Label htmlFor="progress-2" className="cursor-pointer text-center">
                      <div className="text-yellow-500 text-xl mb-1">😐</div>
                      <div className="text-xs">Neutral</div>
                    </Label>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="3" id="progress-3" className="sr-only" />
                    <Label htmlFor="progress-3" className="cursor-pointer text-center">
                      <div className="text-green-500 text-xl mb-1">😊</div>
                      <div className="text-xs">Gut</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Obstacles and Challenges */}
          <div className="space-y-3">
            <Label htmlFor="reflection" className="font-medium">Hürden & Probleme</Label>
            <Textarea
              id="reflection"
              placeholder="Welche Hindernisse sind aufgetreten? Was hat dir Schwierigkeiten bereitet?"
              value={reflection}
              onChange={(e) => onReflectionChange(e.target.value)}
              className="h-24"
            />
          </div>

          {/* Show any custom questions */}
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

          <Button onClick={onSubmit} className="w-full">
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
