
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";

interface CreateChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChallengeCreated?: (challengeId: string) => void;
}

export const CreateChallengeDialog = ({ open, onOpenChange, onChallengeCreated }: CreateChallengeDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Allgemein");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("Einheiten");
  const [endDate, setEndDate] = useState("");
  
  const { toast } = useToast();
  const { user } = useUser();
  
  const createChallengeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('community_challenges')
        .insert({
          title,
          description,
          category,
          target_value: Number(targetValue),
          target_unit: targetUnit,
          end_date: endDate,
          created_by: user.id
        })
        .select();
        
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: (data) => {
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("Allgemein");
      setTargetValue("");
      setTargetUnit("Einheiten");
      setEndDate("");
      
      // Close dialog
      onOpenChange(false);
      
      // Notify parent
      if (onChallengeCreated && data.id) {
        onChallengeCreated(data.id);
      }
      
      toast({
        title: "Challenge erstellt",
        description: "Deine Challenge wurde erfolgreich erstellt.",
      });
    },
    onError: (error) => {
      console.error("Creation error:", error);
      toast({
        title: "Erstellung fehlgeschlagen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim()) {
      toast({
        title: "Titel fehlt",
        description: "Bitte gib einen Titel für deine Challenge ein.",
        variant: "destructive"
      });
      return;
    }
    
    if (!targetValue || Number(targetValue) <= 0) {
      toast({
        title: "Ungültiger Zielwert",
        description: "Bitte gib einen positiven Zielwert ein.",
        variant: "destructive"
      });
      return;
    }
    
    if (!endDate) {
      toast({
        title: "Enddatum fehlt",
        description: "Bitte gib ein Enddatum für deine Challenge ein.",
        variant: "destructive"
      });
      return;
    }
    
    createChallengeMutation.mutate();
  };
  
  // Default to today + 1 month for the end date input
  const defaultEndDate = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  })();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neue Challenge erstellen</DialogTitle>
          <DialogDescription>
            Erstelle eine Challenge und lade andere ein, mitzumachen.
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
              min={new Date().toISOString().split('T')[0]}
              placeholder={defaultEndDate}
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
              disabled={createChallengeMutation.isPending}
            >
              {createChallengeMutation.isPending ? "Wird erstellt..." : "Challenge erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
