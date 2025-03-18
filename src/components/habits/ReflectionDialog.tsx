
import { useState } from "react";
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

interface ReflectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  responses: Record<number, string>;
  onResponseChange: (index: number, value: string) => void;
  reflection: string;
  onReflectionChange: (value: string) => void;
  onSubmit: (reflection: string, obstacles: string) => void;
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
  
  const handleSubmit = () => {
    onSubmit(currentReflection, obstacles);
    setCurrentReflection("");
    setObstacles("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reflexion: {habit?.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="reflection">Reflexion</TabsTrigger>
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
              <Button onClick={handleSubmit} className="w-full">
                Reflexion speichern
              </Button>
            </DialogFooter>
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
