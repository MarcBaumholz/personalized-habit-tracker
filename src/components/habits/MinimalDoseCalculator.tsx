
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Star, Save, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MinimalDoseCalculatorProps {
  habitId?: string;
  onSave?: (data: any) => void;
}

export const MinimalDoseCalculator = ({ habitId, onSave }: MinimalDoseCalculatorProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [doseData, setDoseData] = useState({
    description: "",
    effortPercentage: 30, // Default to 30% effort
  });

  // Get existing minimal dose if any
  const { data: habitData } = useQuery({
    queryKey: ["habit-minimal-dose", habitId],
    queryFn: async () => {
      if (!habitId) return null;
      
      const { data } = await supabase
        .from("habits")
        .select("minimal_dose")
        .eq("id", habitId)
        .single();
      
      if (data && data.minimal_dose) {
        try {
          // Check if the minimal_dose is JSON or just a string
          const parsedData = JSON.parse(data.minimal_dose);
          setDoseData({
            description: parsedData.description || "",
            effortPercentage: parsedData.effortPercentage || 30
          });
        } catch (e) {
          // If it's not valid JSON, treat it as just the description
          setDoseData({
            description: data.minimal_dose,
            effortPercentage: 30
          });
        }
      }
      
      return data;
    },
    enabled: !!habitId
  });

  // Save minimal dose
  const saveDoseMutation = useMutation({
    mutationFn: async () => {
      if (!doseData.description) {
        throw new Error("Beschreibung fehlt");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Store as JSON to have both description and percentage
      const minimalDoseJson = JSON.stringify(doseData);

      const { data, error } = await supabase
        .from("habits")
        .update({ minimal_dose: minimalDoseJson })
        .eq("id", habitId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Minimale Dosis gespeichert",
        description: "Deine minimale Dosis wurde erfolgreich gespeichert.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["habit-minimal-dose", habitId] });
      queryClient.invalidateQueries({ queryKey: ["habit", habitId] });
      
      if (onSave) {
        onSave(doseData);
      }
    },
    onError: (error) => {
      console.error("Error saving minimal dose:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die minimale Dosis konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  });

  const handleSliderChange = (value: number[]) => {
    setDoseData({
      ...doseData,
      effortPercentage: value[0]
    });
  };

  const handleSave = () => {
    if (!doseData.description) {
      toast({
        title: "Beschreibung fehlt",
        description: "Bitte beschreibe die minimale Dosis deiner Gewohnheit.",
        variant: "destructive",
      });
      return;
    }

    saveDoseMutation.mutate();
  };

  return (
    <Card className="shadow-sm border border-amber-100">
      <CardHeader className="bg-amber-50 pb-4 pt-5">
        <CardTitle className="text-xl text-amber-800">Minimale Dosis</CardTitle>
        <p className="text-sm text-gray-600">
          Definiere eine reduzierte Version deiner Gewohnheit für schwierige Tage.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="font-medium text-amber-800 mb-2">Warum eine minimale Dosis wichtig ist:</h3>
          <p className="text-sm text-amber-700">
            Eine minimale Dosis hilft dir, die Kontinuität deiner Gewohnheit aufrechtzuerhalten, 
            auch an Tagen mit wenig Zeit oder Energie. Sie verhindert Unterbrechungen in deiner Streak 
            und trägt zur langfristigen Gewohnheitsbildung bei.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doseDescription">Beschreibe deine minimale Dosis</Label>
            <Textarea
              id="doseDescription"
              value={doseData.description}
              onChange={(e) => setDoseData({ ...doseData, description: e.target.value })}
              placeholder="z.B. Nur 5 Minuten meditieren statt 20 Minuten"
              className="h-20"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="effortPercentage">
                Aufwand (% der regulären Gewohnheit)
              </Label>
              <span className="text-sm font-medium">
                {doseData.effortPercentage}%
              </span>
            </div>
            <Slider
              id="effortPercentage"
              min={5}
              max={75}
              step={5}
              value={[doseData.effortPercentage]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Minimal (5%)</span>
              <span>Moderat (40%)</span>
              <span>Substanziell (75%)</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <Star className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Tipp: Markiere mit dem Stern ⭐</h4>
              <p className="text-xs text-blue-700">
                An schwierigen Tagen kannst du die minimale Dosis mit dem Stern ⭐ markieren, 
                anstatt die Gewohnheit abzuhaken. So bleibt deine Streak erhalten, und du weißt später, 
                an welchen Tagen du die reduzierte Version genutzt hast.
              </p>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-amber-600 hover:bg-amber-700"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Minimale Dosis speichern
        </Button>
      </CardContent>
    </Card>
  );
};
