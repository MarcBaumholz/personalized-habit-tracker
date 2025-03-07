
import { Calendar, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolkitCardActions } from "./ToolkitCardActions";
import { Badge } from "@/components/ui/badge";
import { HabitLoop } from "./HabitLoop";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Toolkit {
  id?: string;
  title: string;
  name?: string;
  description: string;
  category?: string;
  icon?: LucideIcon;
  example?: string;
  steps?: string[];
  type?: string;
  cue?: string;
  craving?: string;
  routine?: string;
  reward?: string;
  minimal_dose?: string;
  impact_area?: string[];
  building_blocks?: string[];
  is_favorite?: boolean;
}

interface ToolkitCardProps {
  toolkit: Toolkit;
  onSelect?: (toolkit: Toolkit) => void;
  onRemove?: (id: string) => void;
  onAdd?: (toolkit: Toolkit) => void;
  onToggleFavorite?: (toolkit: Toolkit) => void;
}

export const ToolkitCard = ({ toolkit, onSelect, onRemove, onAdd, onToggleFavorite }: ToolkitCardProps) => {
  const Icon = toolkit.icon || Calendar;

  const showHabitLoop = toolkit.cue && toolkit.craving && toolkit.routine && toolkit.reward;

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First create the habit
    const { data: habitData, error: habitError } = await supabase
      .from('habits')
      .insert({
        name: toolkit.name || toolkit.title,
        category: toolkit.category || 'routine',
        user_id: user.id,
        cue: toolkit.cue,
        craving: toolkit.craving,
        routine: toolkit.routine,
        reward: toolkit.reward,
        why_description: toolkit.description,
        minimal_dose: toolkit.minimal_dose,
        life_area: toolkit.impact_area?.[0] || 'Persönlichkeit',
        is_keystone: false,
      })
      .select()
      .single();

    if (habitError) {
      toast({
        title: "Fehler",
        description: "Die Gewohnheit konnte nicht erstellt werden.",
        variant: "destructive",
      });
      return;
    }

    // If this is a building block, update its status
    if (toolkit.type === 'building_block' && toolkit.id) {
      const { error: updateError } = await supabase
        .from('building_blocks')
        .update({
          is_converted: true,
          converted_to_habit_id: habitData.id
        })
        .eq('id', toolkit.id);

      if (updateError) {
        console.error('Error updating building block:', updateError);
      }
    }

    toast({
      title: "Gewohnheit erstellt",
      description: "Die neue Gewohnheit wurde erfolgreich hinzugefügt.",
    });

    onAdd?.(toolkit);
  };

  return (
    <div 
      onClick={() => onSelect?.(toolkit)}
      className={cn(
        "group relative min-h-[600px] w-full rounded-xl p-8",
        "cursor-pointer transition-all duration-300",
        "bg-white hover:bg-blue-50",
        "shadow-md hover:shadow-xl hover:-translate-y-1",
        "border border-gray-200"
      )}
    >
      <ToolkitCardActions
        id={toolkit.id}
        onRemove={onRemove}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
        isFavorite={toolkit.is_favorite}
        toolkit={toolkit}
      />

      <ScrollArea className="h-[500px] pr-4">
        <div className="mt-8 mb-8">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-base font-medium">
              <Icon className="h-5 w-5 text-blue-600 mr-2" />
              {toolkit.category || "INSPIRATION"}
            </Badge>
            {toolkit.type === 'building_block' && (
              <Badge variant="outline" className="text-base font-medium">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                Building Block
              </Badge>
            )}
            {toolkit.is_favorite && (
              <Badge variant="favorite" className="text-base font-medium">
                <Star className="h-4 w-4 fill-yellow-500 mr-2" />
                Favorit
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-900">
            {toolkit.name || toolkit.title}
          </h3>
          <p className="text-lg text-gray-600 leading-relaxed">
            {toolkit.description}
          </p>
        </div>

        {showHabitLoop && (
          <HabitLoop 
            toolkit={{
              cue: toolkit.cue!,
              craving: toolkit.craving!,
              routine: toolkit.routine!,
              reward: toolkit.reward!
            }} 
          />
        )}

        {toolkit.minimal_dose && (
          <div className="mt-8">
            <p className="text-lg font-medium text-gray-900 mb-3">Minimal Dose:</p>
            <p className="text-lg text-gray-600 leading-relaxed">{toolkit.minimal_dose}</p>
          </div>
        )}

        {toolkit.example && (
          <div className="mt-8">
            <p className="text-lg font-medium text-gray-900 mb-3">Beispiel:</p>
            <p className="text-lg text-gray-600 leading-relaxed">{toolkit.example}</p>
          </div>
        )}

        {(toolkit.steps || toolkit.impact_area) && (
          <div className="mt-8">
            <p className="text-lg font-medium text-gray-900 mb-3">
              {toolkit.type === 'building_block' ? 'Impact Areas:' : 'Schritte:'}
            </p>
            <ul className="text-lg text-gray-600 list-disc list-inside space-y-3">
              {(toolkit.steps || toolkit.impact_area || []).map((step, index) => (
                <li key={index} className="leading-relaxed">{step}</li>
              ))}
            </ul>
          </div>
        )}

        {toolkit.building_blocks && toolkit.building_blocks.length > 0 && (
          <div className="mt-8">
            <p className="text-lg font-medium text-gray-900 mb-3">Building Blocks:</p>
            <div className="flex flex-wrap gap-2">
              {toolkit.building_blocks.map((block, index) => (
                <Badge key={index} variant="secondary">
                  {block}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="absolute bottom-8 left-8 right-8">
        <Button 
          onClick={handleAdd}
          className={cn(
            "w-full gap-2",
            "bg-blue-600 hover:bg-blue-700 text-white",
            "shadow-sm hover:shadow-md",
            "transition-all duration-200",
            "text-lg font-medium py-7"
          )}
        >
          <Plus className="h-6 w-6" />
          {toolkit.id ? "Als Gewohnheit übernehmen" : "Hinzufügen"}
        </Button>
      </div>
    </div>
  );
};
