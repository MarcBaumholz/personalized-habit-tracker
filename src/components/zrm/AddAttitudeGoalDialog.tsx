
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

export const AddAttitudeGoalDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    goalStatement: "",
    targetEmotion: "",
    ifThenPlan: "",
    embodimentPractice: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("attitude_goals")
        .insert({
          user_id: user.id,
          goal_statement: formData.goalStatement,
          target_emotion: formData.targetEmotion,
          if_then_plan: formData.ifThenPlan,
          embodiment_practice: formData.embodimentPractice,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["attitude-goals"] });
      setOpen(false);
      toast({
        title: "Haltungsziel hinzugefügt",
        description: "Dein Haltungsziel wurde erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Haltungsziel konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Neues Haltungsziel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Haltungsziel hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalStatement">Haltungsziel</Label>
            <Textarea
              id="goalStatement"
              value={formData.goalStatement}
              onChange={(e) => setFormData({ ...formData, goalStatement: e.target.value })}
              placeholder="Ich bin eine Person, die..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetEmotion">Zielemotion</Label>
            <Input
              id="targetEmotion"
              value={formData.targetEmotion}
              onChange={(e) => setFormData({ ...formData, targetEmotion: e.target.value })}
              placeholder="Welche Emotion möchtest du erreichen?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifThenPlan">Wenn-Dann-Plan</Label>
            <Textarea
              id="ifThenPlan"
              value={formData.ifThenPlan}
              onChange={(e) => setFormData({ ...formData, ifThenPlan: e.target.value })}
              placeholder="Wenn X passiert, dann werde ich Y tun..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="embodimentPractice">Embodiment-Übung</Label>
            <Textarea
              id="embodimentPractice"
              value={formData.embodimentPractice}
              onChange={(e) => setFormData({ ...formData, embodimentPractice: e.target.value })}
              placeholder="Welche körperliche Übung unterstützt dein Ziel?"
            />
          </div>

          <Button type="submit" className="w-full">Haltungsziel speichern</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
