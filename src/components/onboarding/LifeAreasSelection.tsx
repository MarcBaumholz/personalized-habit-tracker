
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LIFE_AREAS = [
  { id: "health", name: "Gesundheit", color: "bg-red-100 border-red-200 text-red-700" },
  { id: "relationships", name: "Beziehungen", color: "bg-pink-100 border-pink-200 text-pink-700" },
  { id: "career", name: "Karriere", color: "bg-blue-100 border-blue-200 text-blue-700" },
  { id: "finance", name: "Finanzen", color: "bg-green-100 border-green-200 text-green-700" },
  { id: "personal", name: "Persönlichkeit", color: "bg-purple-100 border-purple-200 text-purple-700" },
  { id: "leisure", name: "Freizeit", color: "bg-yellow-100 border-yellow-200 text-yellow-700" },
  { id: "spiritual", name: "Spiritualität", color: "bg-indigo-100 border-indigo-200 text-indigo-700" },
  { id: "environment", name: "Umwelt", color: "bg-teal-100 border-teal-200 text-teal-700" },
];

export const LifeAreasSelection = ({ onComplete }: { onComplete: () => void }) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const { toast } = useToast();

  const toggleArea = (areaId: string) => {
    if (selectedAreas.includes(areaId)) {
      setSelectedAreas(selectedAreas.filter(id => id !== areaId));
    } else if (selectedAreas.length < 3) {
      setSelectedAreas([...selectedAreas, areaId]);
    } else {
      toast({
        title: "Maximum erreicht",
        description: "Wähle maximal 3 Lebensbereiche aus",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedAreas.length === 0) {
      toast({
        title: "Keine Auswahl",
        description: "Bitte wähle mindestens einen Lebensbereich aus",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("onboarding_responses").insert({
        user_id: user.id,
        question_key: "life_areas",
        response: JSON.stringify(selectedAreas),
      });

      if (error) throw error;

      toast({
        title: "Gespeichert",
        description: "Deine Auswahl wurde erfolgreich gespeichert",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Deine Auswahl konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto p-6 space-y-6 bg-white/80 backdrop-blur-sm">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-blue-800">Wähle deine Lebensbereiche</h2>
        <p className="text-blue-600">
          Wähle bis zu 3 Bereiche aus, auf die du dich konzentrieren möchtest
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {LIFE_AREAS.map((area) => (
          <button
            key={area.id}
            onClick={() => toggleArea(area.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-300 flex items-center justify-between ${
              area.color
            } ${
              selectedAreas.includes(area.id)
                ? "border-opacity-100 ring-2 ring-blue-400"
                : "border-opacity-50 hover:border-opacity-100"
            }`}
          >
            <span className="font-medium">{area.name}</span>
            {selectedAreas.includes(area.id) && (
              <Check className="w-5 h-5" />
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Weiter
      </Button>
    </Card>
  );
};
