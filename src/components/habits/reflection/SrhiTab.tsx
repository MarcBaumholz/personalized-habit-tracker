
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface SrhiTabProps {
  questions: string[];
  onSubmit: (responses: Record<number, string>) => void;
  onClose: () => void;
}

export const SrhiTab = ({ questions, onSubmit, onClose }: SrhiTabProps) => {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const { toast } = useToast();

  const handleSrhiChange = (index: number, value: string) => {
    setResponses(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleSrhiSubmit = () => {
    // Check if at least one question has been answered
    if (Object.keys(responses).length === 0) {
      toast({
        title: "Bitte beantworte mindestens eine Frage",
        description: "Um den SRHI zu speichern, beantworte bitte mindestens eine Frage.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(responses);
    setResponses({});
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={index} className="space-y-2">
          <Label className="text-sm">{question}</Label>
          <RadioGroup 
            value={responses[index] || ""} 
            onValueChange={(value) => handleSrhiChange(index, value)}
            className="flex space-x-1"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <div key={value} className="flex flex-col items-center">
                <RadioGroupItem 
                  value={value.toString()} 
                  id={`q${index}-${value}`} 
                  className="peer sr-only" 
                />
                <Label 
                  htmlFor={`q${index}-${value}`}
                  className="px-3 py-2 rounded-md cursor-pointer border peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                >
                  {value}
                </Label>
                {value === 1 && <span className="text-xs mt-1">Trifft nicht zu</span>}
                {value === 7 && <span className="text-xs mt-1">Trifft voll zu</span>}
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
      
      <DialogFooter>
        <Button onClick={handleSrhiSubmit} className="w-full">
          SRHI speichern
        </Button>
      </DialogFooter>
    </div>
  );
};
