
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface ReflectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  responses: Record<number, string>;
  onResponseChange: (index: number, value: string) => void;
  reflection: string;
  onReflectionChange: (value: string) => void;
  onSubmit: (reflection: string, obstacles: string, srhiResponses?: Record<number, string>) => void;
  habit?: any;
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
  habit
}: ReflectionDialogProps) => {
  const [currentReflection, setCurrentReflection] = useState("");
  const [obstacles, setObstacles] = useState("");
  const [activeTab, setActiveTab] = useState("reflection");
  const [srhi, setSrhi] = useState<Record<number, string>>({});
  const { toast } = useToast();
  
  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentReflection("");
      setObstacles("");
      setSrhi({});
    }
  }, [isOpen]);
  
  // Get the latest reflection if available
  const getLatestReflection = () => {
    if (!habit || !habit.habit_reflections || habit.habit_reflections.length === 0) {
      return null;
    }
    
    return habit.habit_reflections.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };
  
  const latestReflection = getLatestReflection();
  
  const handleReflectionSubmit = () => {
    onSubmit(currentReflection, obstacles);
    setCurrentReflection("");
    setObstacles("");
    toast({
      title: "Reflexion gespeichert",
      description: "Deine Reflexion wurde erfolgreich gespeichert."
    });
    onClose();
  };

  const handleSrhiSubmit = () => {
    // Check if at least one question has been answered
    if (Object.keys(srhi).length === 0) {
      toast({
        title: "Bitte beantworte mindestens eine Frage",
        description: "Um den SRHI zu speichern, beantworte bitte mindestens eine Frage.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit("", "", srhi);
    setSrhi({});
    toast({
      title: "SRHI gespeichert",
      description: "Deine SRHI-Antworten wurden erfolgreich gespeichert."
    });
    onClose();
  };

  const handleSrhiChange = (index: number, value: string) => {
    setSrhi(prev => ({
      ...prev,
      [index]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reflexion: {habit?.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="reflection">Reflexion</TabsTrigger>
            <TabsTrigger value="srhi">SRHI</TabsTrigger>
            <TabsTrigger value="history">Verlauf</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reflection" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Deine Gedanken zur Gewohnheit</Label>
                <Textarea
                  placeholder="Wie läuft es mit dieser Gewohnheit? Was funktioniert gut, was könnte besser sein?"
                  className="min-h-[100px]"
                  value={currentReflection}
                  onChange={(e) => setCurrentReflection(e.target.value)}
                />
              </div>
              
              <div>
                <Label className="mb-2 block">Hürden & Hindernisse</Label>
                <Textarea
                  placeholder="Welche Hürden hast du erlebt? Was hat dich aufgehalten?"
                  className="min-h-[100px]"
                  value={obstacles}
                  onChange={(e) => setObstacles(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleReflectionSubmit} className="w-full">
                Reflexion speichern
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="srhi" className="space-y-4">
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="space-y-2">
                  <Label className="text-sm">{question}</Label>
                  <RadioGroup 
                    value={srhi[index] || ""} 
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
          </TabsContent>
          
          <TabsContent value="history">
            {habit?.habit_reflections && habit.habit_reflections.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {habit.habit_reflections
                  .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((ref: any, index: number) => (
                    <div key={index} className="border p-4 rounded-lg space-y-2">
                      <div className="text-sm text-gray-500">
                        {format(new Date(ref.created_at), "dd.MM.yyyy")}
                      </div>
                      
                      {ref.reflection_text && (
                        <div>
                          <h4 className="font-medium text-sm">Reflexion</h4>
                          <p className="text-sm">{ref.reflection_text}</p>
                        </div>
                      )}
                      
                      {ref.obstacles && (
                        <div>
                          <h4 className="font-medium text-sm">Hürden & Hindernisse</h4>
                          <p className="text-sm">{ref.obstacles}</p>
                        </div>
                      )}
                      
                      {ref.srhi_responses && (
                        <div>
                          <h4 className="font-medium text-sm">SRHI-Antworten</h4>
                          <ul className="text-sm space-y-1">
                            {Object.entries(JSON.parse(ref.srhi_responses || "{}")).map(([idx, val]) => (
                              <li key={idx}>
                                {questions[parseInt(idx)]}: {String(val)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                Noch keine Reflexionen vorhanden.
              </div>
            )}
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={onClose} className="w-full">
                Schließen
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
