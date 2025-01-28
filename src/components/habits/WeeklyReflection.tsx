import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const SRHI_QUESTIONS = [
  "Dieses Verhalten ist etwas, das ich automatisch tue.",
  "Dieses Verhalten ist etwas, das ich ohne nachzudenken tue.",
  "Dieses Verhalten ist etwas, das ich tue, ohne dass ich mich daran erinnern muss.",
  "Dieses Verhalten ist etwas, das typisch für mich ist.",
  "Dieses Verhalten ist etwas, das ich schon lange tue.",
];

export const WeeklyReflection = () => {
  const [open, setOpen] = useState(false);
  const [responses, setResponses] = useState<Record<number, string>>({});

  const handleSubmit = () => {
    console.log("SRHI Responses:", responses);
    // Here we would save to Supabase once connected
    setOpen(false);
  };

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-primary">Wöchentliche Reflexion</h2>
      <p className="text-text-secondary">
        Nimm dir Zeit, um über deine Fortschritte nachzudenken und deine
        Gewohnheiten anzupassen.
      </p>
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-primary" />
        <span className="text-sm">Nächste Reflexion: Sonntag</span>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Reflexion starten</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>SRHI - Self-Report Habit Index</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {SRHI_QUESTIONS.map((question, index) => (
              <div key={index} className="space-y-2">
                <Label>{question}</Label>
                <RadioGroup
                  value={responses[index]}
                  onValueChange={(value) =>
                    setResponses((prev) => ({ ...prev, [index]: value }))
                  }
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
            <Button onClick={handleSubmit} className="w-full">
              Reflexion abschließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};