
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, MousePointerClick, Gift, PiggyBank, InfinityIcon, Save, Info, AlertCircle, Zap, Eye, Heart, Trophy, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HookedModelProps {
  habitId: string;
  onSave?: () => void;
}

export const HookedModel = ({ habitId, onSave }: HookedModelProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    trigger_external: "",
    trigger_internal: "",
    action: "",
    reward_type: "tribe" as "tribe" | "hunt" | "self", // Explicitly typed as union
    reward_description: "",
    investment: "",
    five_whys: ["", "", "", "", ""],
    habit_zone_frequency: "",
    habit_zone_value: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleWhyChange = (index: number, value: string) => {
    const newWhys = [...formData.five_whys];
    newWhys[index] = value;
    setFormData({ ...formData, five_whys: newWhys });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      // Save the Hooked model data
      const { error } = await supabase
        .from('habit_hooked_models')
        .upsert({
          habit_id: habitId,
          user_id: user.id,
          trigger_external: formData.trigger_external,
          trigger_internal: formData.trigger_internal,
          action: formData.action,
          reward_type: formData.reward_type,
          reward_description: formData.reward_description,
          investment: formData.investment,
          five_whys: formData.five_whys,
          habit_zone_frequency: formData.habit_zone_frequency,
          habit_zone_value: formData.habit_zone_value
        }, { onConflict: 'habit_id,user_id' });

      if (error) throw error;

      toast({
        title: "Hooked-Modell gespeichert",
        description: "Deine Gewohnheits-Analyse wurde erfolgreich gespeichert.",
      });

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving Hooked model:", error);
      toast({
        title: "Fehler beim Speichern",
        description: "Es gab ein Problem beim Speichern deines Hooked-Modells.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const loadHookedModel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('habit_hooked_models')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
          console.error("Error loading Hooked model:", error);
        }
        return;
      }

      if (data) {
        setFormData({
          trigger_external: data.trigger_external || "",
          trigger_internal: data.trigger_internal || "",
          action: data.action || "",
          reward_type: (data.reward_type as "tribe" | "hunt" | "self") || "tribe",
          reward_description: data.reward_description || "",
          investment: data.investment || "",
          five_whys: data.five_whys || ["", "", "", "", ""],
          habit_zone_frequency: data.habit_zone_frequency || "",
          habit_zone_value: data.habit_zone_value || ""
        });
      }
    } catch (error) {
      console.error("Error loading Hooked model:", error);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    loadHookedModel();
  }, [habitId]);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-blue-700">Hooked-Modell</h2>
        <p className="text-gray-600">
          Analysiere deine Gewohnheit mit dem Hooked-Modell von Nir Eyal: Auslöser, Aktion, variable Belohnung und Investition.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-700">Auslöser (Trigger)</h3>
            </div>
            
            <div className="space-y-4 pl-12">
              <div>
                <Label htmlFor="external-trigger" className="flex items-center gap-2">
                  Externe Auslöser <Info className="h-4 w-4 text-gray-400" />
                </Label>
                <p className="text-sm text-gray-500 mb-2">Signale aus deiner Umgebung (z.B. Benachrichtigungen, Erinnerungen)</p>
                <Textarea 
                  id="external-trigger"
                  placeholder="z.B. Handywecker, Notizen am Spiegel, Erinnerung von Freunden..."
                  className="min-h-[80px]"
                  value={formData.trigger_external}
                  onChange={(e) => handleInputChange('trigger_external', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="internal-trigger" className="flex items-center gap-2">
                  Interne Auslöser <Info className="h-4 w-4 text-gray-400" />
                </Label>
                <p className="text-sm text-gray-500 mb-2">Emotionale Zustände oder Bedürfnisse (z.B. Langeweile, Einsamkeit, Neugier)</p>
                <Textarea 
                  id="internal-trigger"
                  placeholder="z.B. Wenn ich mich gestresst fühle, wenn ich nach einem langen Tag abschalten will..."
                  className="min-h-[80px]"
                  value={formData.trigger_internal}
                  onChange={(e) => handleInputChange('trigger_internal', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <MousePointerClick className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-700">Aktion (Action)</h3>
            </div>
            
            <div className="pl-12">
              <Label htmlFor="action" className="flex items-center gap-2">
                Die einfache Handlung <Info className="h-4 w-4 text-gray-400" />
              </Label>
              <p className="text-sm text-gray-500 mb-2">Das konkrete Verhalten, das ausgeführt werden soll - möglichst einfach gestaltet</p>
              <Textarea 
                id="action"
                placeholder="z.B. Eine Meditationsapp öffnen und den Start-Button drücken..."
                className="min-h-[80px]"
                value={formData.action}
                onChange={(e) => handleInputChange('action', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-purple-700">Variable Belohnung (Reward)</h3>
            </div>
            
            <div className="pl-12 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={formData.reward_type === "tribe" ? "default" : "outline"}
                  className={`flex flex-col items-center justify-center h-24 ${formData.reward_type === "tribe" ? "border-2 border-purple-500" : ""}`}
                  onClick={() => handleInputChange('reward_type', 'tribe')}
                >
                  <Heart className="h-8 w-8 mb-2" />
                  <span>Sozial (Stamm)</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.reward_type === "hunt" ? "default" : "outline"}
                  className={`flex flex-col items-center justify-center h-24 ${formData.reward_type === "hunt" ? "border-2 border-purple-500" : ""}`}
                  onClick={() => handleInputChange('reward_type', 'hunt')}
                >
                  <Trophy className="h-8 w-8 mb-2" />
                  <span>Materiell (Jagd)</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.reward_type === "self" ? "default" : "outline"}
                  className={`flex flex-col items-center justify-center h-24 ${formData.reward_type === "self" ? "border-2 border-purple-500" : ""}`}
                  onClick={() => handleInputChange('reward_type', 'self')}
                >
                  <Sparkles className="h-8 w-8 mb-2" />
                  <span>Intrinsisch (Selbst)</span>
                </Button>
              </div>
              
              <div>
                <Label htmlFor="reward-description">Beschreibe deine Belohnung</Label>
                <Textarea 
                  id="reward-description"
                  placeholder="z.B. Ich fühle mich ruhiger und zentrierter nach der Meditation..."
                  className="min-h-[80px]"
                  value={formData.reward_description}
                  onChange={(e) => handleInputChange('reward_description', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-full">
                <PiggyBank className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-amber-700">Investition (Investment)</h3>
            </div>
            
            <div className="pl-12">
              <Label htmlFor="investment" className="flex items-center gap-2">
                Die Investition des Nutzers <Info className="h-4 w-4 text-gray-400" />
              </Label>
              <p className="text-sm text-gray-500 mb-2">Was du in die Gewohnheit investierst (Zeit, Daten, Mühe, soziales Kapital)</p>
              <Textarea 
                id="investment"
                placeholder="z.B. Ich trage meine Meditationsstatistiken ein, habe Premium gekauft, habe Freunde eingeladen..."
                className="min-h-[80px]"
                value={formData.investment}
                onChange={(e) => handleInputChange('investment', e.target.value)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 p-2 rounded-full">
                <InfinityIcon className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-cyan-700">Habit Zone</h3>
            </div>
            
            <div className="pl-12 space-y-4">
              <div>
                <Label htmlFor="habit-zone-frequency">Nutzungshäufigkeit</Label>
                <p className="text-sm text-gray-500 mb-2">Wie oft wird die Gewohnheit ausgeführt?</p>
                <Input
                  id="habit-zone-frequency"
                  placeholder="z.B. täglich, 3x pro Woche, etc."
                  value={formData.habit_zone_frequency}
                  onChange={(e) => handleInputChange('habit_zone_frequency', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="habit-zone-value">Wahrgenommener Nutzen</Label>
                <p className="text-sm text-gray-500 mb-2">Wie wertvoll ist die Gewohnheit für dich im Vergleich zu Alternativen?</p>
                <Input
                  id="habit-zone-value"
                  placeholder="z.B. Sehr hoch, da es mir hilft, fokussierter zu arbeiten"
                  value={formData.habit_zone_value}
                  onChange={(e) => handleInputChange('habit_zone_value', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-red-700">5-Whys-Methode</h3>
            </div>
            
            <div className="pl-12 space-y-3">
              <p className="text-sm text-gray-600">
                Verstehe die tieferen Motivationen hinter deiner Gewohnheit, indem du dich fünfmal fragst, warum du sie ausführen willst.
              </p>
              
              {formData.five_whys.map((why, index) => (
                <div key={index}>
                  <Label htmlFor={`why-${index + 1}`} className="flex items-center gap-2">
                    Warum {index + 1}: {index === 0 ? "Warum will ich diese Gewohnheit entwickeln?" : `Warum ist das bei Warum ${index} Genannte wichtig?`}
                  </Label>
                  <Textarea 
                    id={`why-${index + 1}`}
                    placeholder={`z.B. ${index === 0 ? "Weil ich produktiver sein möchte" : "Weil..."}`}
                    value={why}
                    onChange={(e) => handleWhyChange(index, e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        className="w-full" 
        size="lg"
        disabled={saving}
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Speichern...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Hooked-Modell speichern
          </span>
        )}
      </Button>
    </div>
  );
};
