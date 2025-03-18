
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ReflectionTabProps {
  onSubmit: (reflection: string, obstacles: string) => void;
  onClose: () => void;
}

export const ReflectionTab = ({ onSubmit, onClose }: ReflectionTabProps) => {
  const [currentReflection, setCurrentReflection] = useState("");
  const [obstacles, setObstacles] = useState("");
  const { toast } = useToast();

  const handleReflectionSubmit = () => {
    // Validate that we have at least reflection text or obstacles
    if (!currentReflection.trim() && !obstacles.trim()) {
      toast({
        title: "Bitte fülle mindestens ein Feld aus",
        description: "Entweder Reflexion oder Hürden müssen ausgefüllt sein.",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit(currentReflection, obstacles);
    setCurrentReflection("");
    setObstacles("");
  };

  return (
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
      
      <DialogFooter>
        <Button onClick={handleReflectionSubmit} className="w-full">
          Reflexion speichern
        </Button>
      </DialogFooter>
    </div>
  );
};
