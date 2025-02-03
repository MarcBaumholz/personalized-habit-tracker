import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Smile, Meh, Frown, ThumbsUp, Heart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface EmotionTrackerProps {
  habitId: string;
  onClose: () => void;
}

export const EmotionTracker = ({ habitId, onClose }: EmotionTrackerProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string>("");
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const emotions = [
    { icon: ThumbsUp, value: "accomplished", label: "Accomplished" },
    { icon: Heart, value: "motivated", label: "Motivated" },
    { icon: Smile, value: "happy", label: "Happy" },
    { icon: Meh, value: "neutral", label: "Neutral" },
    { icon: Frown, value: "struggling", label: "Struggling" },
  ];

  const saveEmotion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("habit_emotions")
        .insert({
          habit_id: habitId,
          user_id: user.id,
          emotion: selectedEmotion,
          note,
        });

      if (error) throw error;

      toast({
        title: "Emotion gespeichert",
        description: "Deine Gefühle wurden erfolgreich aufgezeichnet.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Gefühle konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        {emotions.map(({ icon: Icon, value, label }) => (
          <Button
            key={value}
            variant={selectedEmotion === value ? "default" : "outline"}
            className="flex flex-col items-center p-4"
            onClick={() => setSelectedEmotion(value)}
          >
            <Icon className="h-6 w-6 mb-2" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </div>
      <Textarea
        placeholder="Möchtest du deine Gefühle näher beschreiben?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="h-24"
      />
      <Button
        className="w-full"
        onClick={saveEmotion}
        disabled={!selectedEmotion}
      >
        Speichern
      </Button>
    </div>
  );
};