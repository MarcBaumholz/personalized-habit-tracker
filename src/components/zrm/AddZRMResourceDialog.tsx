
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export const AddZRMResourceDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    resourceType: "",
    resourceContent: "",
    emotionAssociation: "",
    somaticMarkerStrength: "3",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("zrm_resources")
        .insert({
          user_id: user.id,
          resource_type: formData.resourceType,
          resource_content: formData.resourceContent,
          emotion_association: formData.emotionAssociation,
          somatic_marker_strength: parseInt(formData.somaticMarkerStrength),
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["zrm-resources"] });
      setOpen(false);
      toast({
        title: "Ressource hinzugefügt",
        description: "Deine ZRM Ressource wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Ressource konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Neue ZRM Ressource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue ZRM Ressource hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resourceType">Ressourcen-Typ</Label>
            <Select
              value={formData.resourceType}
              onValueChange={(value) => setFormData({ ...formData, resourceType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wähle einen Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Bild</SelectItem>
                <SelectItem value="music">Musik</SelectItem>
                <SelectItem value="mantra">Mantra</SelectItem>
                <SelectItem value="movement">Bewegung</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceContent">Beschreibung/Inhalt</Label>
            <Textarea
              id="resourceContent"
              value={formData.resourceContent}
              onChange={(e) => setFormData({ ...formData, resourceContent: e.target.value })}
              placeholder="Beschreibe deine Ressource..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotionAssociation">Emotionale Verbindung</Label>
            <Input
              id="emotionAssociation"
              value={formData.emotionAssociation}
              onChange={(e) => setFormData({ ...formData, emotionAssociation: e.target.value })}
              placeholder="Mit welcher Emotion verbindest du diese Ressource?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="somaticMarkerStrength">Stärke des somatischen Markers (1-5)</Label>
            <Select
              value={formData.somaticMarkerStrength}
              onValueChange={(value) => setFormData({ ...formData, somaticMarkerStrength: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wähle die Stärke" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">Ressource speichern</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
