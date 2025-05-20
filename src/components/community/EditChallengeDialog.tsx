
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  challenge: {
    title: string;
    description: string;
    category: string;
    target: {
      value: number;
      unit: string;
    };
    endDate: string;
  };
}

export const EditChallengeDialog = ({ open, onOpenChange, challengeId, challenge }: EditChallengeDialogProps) => {
  const [title, setTitle] = useState(challenge.title);
  const [description, setDescription] = useState(challenge.description);
  const [category, setCategory] = useState(challenge.category);
  const [targetValue, setTargetValue] = useState(challenge.target.value.toString());
  const [targetUnit, setTargetUnit] = useState(challenge.target.unit);
  const [endDate, setEndDate] = useState(challenge.endDate);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateChallengeMutation = useMutation({
    mutationFn: async () => {
      // In a real app, we would update the challenge details in the database
      // Currently this is a simulation since we don't have a full backend implemented
      
      // const { data, error } = await supabase
      //   .from('challenges')
      //   .update({
      //     title,
      //     description,
      //     category,
      //     target_value: Number(targetValue),
      //     target_unit: targetUnit,
      //     end_date: endDate
      //   })
      //   .eq('id', challengeId);
      
      // if (error) throw error;
      
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge', challengeId] });
      onOpenChange(false);
      toast({
        title: "Challenge aktualisiert",
        description: "Die Challenge wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Aktualisierung fehlgeschlagen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateChallengeMutation.mutate();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Challenge bearbeiten</DialogTitle>
          <DialogDescription>
            Bearbeite die Details deiner Challenge.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titel</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="z.B. '100 km Laufen'" 
            />
          </div>
          
          <div>
            <Label htmlFor="category">Kategorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Wähle eine Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Bildung">Bildung</SelectItem>
                <SelectItem value="Ernährung">Ernährung</SelectItem>
                <SelectItem value="Finanzen">Finanzen</SelectItem>
                <SelectItem value="Mindfulness">Mindfulness</SelectItem>
                <SelectItem value="Allgemein">Allgemein</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Worum geht es in dieser Challenge?" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-value">Zielwert</Label>
              <Input 
                id="target-value" 
                type="number" 
                min="1" 
                value={targetValue} 
                onChange={(e) => setTargetValue(e.target.value)} 
                placeholder="z.B. 100" 
              />
            </div>
            <div>
              <Label htmlFor="target-unit">Einheit</Label>
              <Select value={targetUnit} onValueChange={setTargetUnit}>
                <SelectTrigger id="target-unit">
                  <SelectValue placeholder="Wähle eine Einheit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometer (km)</SelectItem>
                  <SelectItem value="Seiten">Seiten</SelectItem>
                  <SelectItem value="Minuten">Minuten</SelectItem>
                  <SelectItem value="Stunden">Stunden</SelectItem>
                  <SelectItem value="Tage">Tage</SelectItem>
                  <SelectItem value="Mal">Wiederholungen</SelectItem>
                  <SelectItem value="Einheiten">Einheiten</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="end-date">Enddatum</Label>
            <Input 
              id="end-date" 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600"
              disabled={updateChallengeMutation.isPending}
            >
              {updateChallengeMutation.isPending ? "Wird aktualisiert..." : "Speichern"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
