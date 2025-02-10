
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export const AddReflectionDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    energyLevel: "5",
    moodRating: "5",
    challenges: "",
    solutions: "",
    valuesAlignment: "",
    strengthsUsed: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("coaching_reflections")
        .insert({
          user_id: user.id,
          energy_level: parseInt(formData.energyLevel),
          mood_rating: parseInt(formData.moodRating),
          challenges: formData.challenges,
          solutions: formData.solutions,
          values_alignment: formData.valuesAlignment,
          strengths_used: formData.strengthsUsed,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["coaching-reflections"] });
      setOpen(false);
      toast({
        title: "Reflexion hinzugefügt",
        description: "Deine Coaching-Reflexion wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Reflexion konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Reflexion
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neue Coaching-Reflexion</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energyLevel">Energielevel (1-10)</Label>
              <Select
                value={formData.energyLevel}
                onValueChange={(value) => setFormData({ ...formData, energyLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wähle dein Energielevel" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moodRating">Stimmung (1-10)</Label>
              <Select
                value={formData.moodRating}
                onValueChange={(value) => setFormData({ ...formData, moodRating: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wähle deine Stimmung" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="challenges">Herausforderungen</Label>
            <Textarea
              id="challenges"
              value={formData.challenges}
              onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
              placeholder="Welchen Herausforderungen bist du heute begegnet?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solutions">Lösungsansätze</Label>
            <Textarea
              id="solutions"
              value={formData.solutions}
              onChange={(e) => setFormData({ ...formData, solutions: e.target.value })}
              placeholder="Wie bist du mit diesen Herausforderungen umgegangen?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valuesAlignment">Werte-Ausrichtung</Label>
            <Textarea
              id="valuesAlignment"
              value={formData.valuesAlignment}
              onChange={(e) => setFormData({ ...formData, valuesAlignment: e.target.value })}
              placeholder="Wie hast du heute deine Werte gelebt?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="strengthsUsed">Genutzte Stärken</Label>
            <Input
              id="strengthsUsed"
              placeholder="Stärken durch Komma getrennt eingeben"
              value={formData.strengthsUsed.join(", ")}
              onChange={(e) => setFormData({
                ...formData,
                strengthsUsed: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
              })}
            />
          </div>

          <Button type="submit" className="w-full">Reflexion speichern</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
