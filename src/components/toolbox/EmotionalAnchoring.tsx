
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Image, Music, Edit3, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface EmotionalAnchoringProps {
  habitId?: string;
  onSave?: (data: any) => void;
}

const resourceTypes = [
  { value: "image", label: "Bild", icon: Image },
  { value: "word", label: "Kraftwort", icon: Edit3 },
  { value: "quote", label: "Zitat", icon: Edit3 },
  { value: "affirmation", label: "Affirmation", icon: Edit3 },
];

const emotions = [
  "Freude", "Begeisterung", "Zufriedenheit", "Stolz", 
  "Dankbarkeit", "Gelassenheit", "Neugier", "Kraft"
];

export const EmotionalAnchoring = ({ habitId, onSave }: EmotionalAnchoringProps) => {
  const { toast } = useToast();
  const [resourceData, setResourceData] = useState({
    resourceType: "word",
    resourceContent: "",
    somaticMarkerStrength: 3,
    emotionAssociation: ""
  });

  const { data: existingResources } = useQuery({
    queryKey: ["zrm-resources", habitId],
    queryFn: async () => {
      if (!habitId) return [];
      
      const { data } = await supabase
        .from("zrm_resources")
        .select("*")
        .eq("habit_id", habitId);
      
      return data || [];
    },
    enabled: !!habitId
  });

  const handleSliderChange = (value: number[]) => {
    setResourceData({
      ...resourceData,
      somaticMarkerStrength: value[0]
    });
  };

  const handleSave = async () => {
    if (!resourceData.resourceContent) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte gib den Inhalt der Ressource an.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      const resource = {
        resource_type: resourceData.resourceType,
        resource_content: resourceData.resourceContent,
        somatic_marker_strength: resourceData.somaticMarkerStrength,
        emotion_association: resourceData.emotionAssociation,
        habit_id: habitId,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from("zrm_resources")
        .insert(resource);

      if (error) throw error;

      toast({
        title: "Ressource gespeichert",
        description: "Deine emotionale Ressource wurde erfolgreich gespeichert.",
      });

      // Reset form
      setResourceData({
        resourceType: "word",
        resourceContent: "",
        somaticMarkerStrength: 3,
        emotionAssociation: ""
      });

      if (onSave) {
        onSave(resource);
      }
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Die Ressource konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  const ResourceTypeIcon = resourceTypes.find(
    (type) => type.value === resourceData.resourceType
  )?.icon || Edit3;

  return (
    <Card className="shadow-sm border border-blue-100">
      <CardHeader className="bg-blue-50 pb-4 pt-5">
        <CardTitle className="text-xl text-blue-800">
          ZRM Ressourcen-Aktivierung
        </CardTitle>
        <p className="text-sm text-gray-600">
          Verknüpfe deine Gewohnheit mit positiven Emotionen für langfristigen Erfolg.
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="font-medium text-amber-800 mb-2">Wie das ZRM funktioniert:</h3>
          <p className="text-sm text-amber-700">
            Das Zürcher Ressourcen Modell (ZRM) nutzt positive emotionale Verknüpfungen, 
            um neue Gewohnheiten zu stärken. Durch die Verbindung deiner Gewohnheit mit 
            positiven "somatischen Markern" (emotionale Reaktionen), erhöhst du deine Motivation 
            und Durchhaltevermögen signifikant.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resourceType">Art der Ressource</Label>
            <Select
              value={resourceData.resourceType}
              onValueChange={(value) => setResourceData({ ...resourceData, resourceType: value })}
            >
              <SelectTrigger id="resourceType">
                <SelectValue placeholder="Wähle einen Ressourcentyp" />
              </SelectTrigger>
              <SelectContent>
                {resourceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center">
                      <type.icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceContent">Inhalt der Ressource</Label>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {resourceData.resourceType === "image" ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-4">
                      Beschreibe ein Bild, das bei dir positive Gefühle auslöst
                    </p>
                    <Textarea
                      id="resourceContent"
                      value={resourceData.resourceContent}
                      onChange={(e) =>
                        setResourceData({
                          ...resourceData,
                          resourceContent: e.target.value,
                        })
                      }
                      placeholder="z.B. Ein Sonnenuntergang am Meer, der mich an meinen letzten Urlaub erinnert"
                      className="h-20"
                    />
                  </div>
                ) : (
                  <Textarea
                    id="resourceContent"
                    value={resourceData.resourceContent}
                    onChange={(e) =>
                      setResourceData({
                        ...resourceData,
                        resourceContent: e.target.value,
                      })
                    }
                    placeholder={
                      resourceData.resourceType === "word"
                        ? "z.B. Energievoll, Stark, Fokussiert"
                        : resourceData.resourceType === "quote"
                        ? "z.B. 'Der Weg ist das Ziel.'"
                        : "z.B. Ich bin eine Person, die täglich für ihre Gesundheit sorgt."
                    }
                    className="h-20"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotionAssociation">Emotionale Verknüpfung</Label>
            <Select
              value={resourceData.emotionAssociation}
              onValueChange={(value) => setResourceData({ ...resourceData, emotionAssociation: value })}
            >
              <SelectTrigger id="emotionAssociation">
                <SelectValue placeholder="Welches Gefühl löst es aus?" />
              </SelectTrigger>
              <SelectContent>
                {emotions.map((emotion) => (
                  <SelectItem key={emotion} value={emotion}>
                    {emotion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="somaticMarkerStrength">
                Emotionale Stärke
              </Label>
              <span className="text-sm font-medium">
                {resourceData.somaticMarkerStrength} / 5
              </span>
            </div>
            <Slider
              id="somaticMarkerStrength"
              min={1}
              max={5}
              step={1}
              value={[resourceData.somaticMarkerStrength]}
              onValueChange={handleSliderChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Schwach</span>
              <span>Mittel</span>
              <span>Stark</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Ressource speichern
        </Button>

        {existingResources && existingResources.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-700 mb-3">
              Deine gespeicherten Ressourcen:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {existingResources.map((resource: any) => (
                <div
                  key={resource.id}
                  className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm font-medium text-blue-800">
                      {resourceTypes.find(t => t.value === resource.resource_type)?.label || resource.resource_type}
                    </span>
                    <div className="flex">
                      {Array.from({ length: resource.somatic_marker_strength || 0 }).map((_, i) => (
                        <Check key={i} className="h-3 w-3 text-blue-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">{resource.resource_content}</p>
                  {resource.emotion_association && (
                    <p className="text-xs text-blue-600 mt-1">
                      Emotion: {resource.emotion_association}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
