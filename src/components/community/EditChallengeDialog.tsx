
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";

interface EditChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challengeId: string;
  onChallengeUpdated?: (challengeId: string) => void;
}

export const EditChallengeDialog = ({ open, onOpenChange, challengeId, onChallengeUpdated }: EditChallengeDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Allgemein");
  const [targetValue, setTargetValue] = useState("");
  const [targetUnit, setTargetUnit] = useState("Einheiten");
  const [endDate, setEndDate] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();
  
  // Check if challenge exists in the database
  const { data: challenge, isLoading } = useQuery({
    queryKey: ['edit-challenge', challengeId],
    enabled: !!challengeId && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('id', challengeId)
        .single();
        
      if (error) {
        // Try to get by legacy ID
        const { data: legacyData, error: legacyError } = await supabase
          .from('community_challenges')
          .select('*')
          .eq('legacy_id', challengeId)
          .single();
          
        if (legacyError) {
          throw legacyError;
        }
        
        return legacyData;
      }
      
      return data;
    }
  });
  
  // Update form when challenge data changes
  useEffect(() => {
    if (challenge) {
      setTitle(challenge.title || "");
      setDescription(challenge.description || "");
      setCategory(challenge.category || "Allgemein");
      setTargetValue(challenge.target_value?.toString() || "");
      setTargetUnit(challenge.target_unit || "Einheiten");
      setEndDate(challenge.end_date ? new Date(challenge.end_date).toISOString().split('T')[0] : "");
    }
  }, [challenge]);
  
  // The update mutation handles updating existing challenges
  const updateChallengeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!challenge) throw new Error("Challenge not found");
      
      const challengeData = {
        title,
        description,
        category,
        target_value: Number(targetValue),
        target_unit: targetUnit,
        end_date: endDate
      };
      
      // Update existing challenge
      const { data, error } = await supabase
        .from('community_challenges')
        .update(challengeData)
        .eq('id', challenge.id)
        .select();
        
      if (error) throw error;
      
      return data[0];
    },
    onSuccess: (data) => {
      // Close dialog
      onOpenChange(false);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['challenge-data', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['edit-challenge', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      
      // Notify parent component
      if (onChallengeUpdated && data?.id) {
        onChallengeUpdated(data.id);
      }
      
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
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
};
