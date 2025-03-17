
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ImplementationIntention {
  id?: string;
  if_part: string;
  then_part: string;
}

export interface ImplementationIntentionsProps {
  habitId: string;
  title?: string;
  description?: string;
}

export const ImplementationIntentions = ({
  habitId,
  title = "Wenn-Dann-Pläne",
  description = "Erstelle konkrete Wenn-Dann-Pläne, um deine Gewohnheit zu etablieren."
}: ImplementationIntentionsProps) => {
  const [intentions, setIntentions] = useState<ImplementationIntention[]>([]);
  const [newIntention, setNewIntention] = useState<ImplementationIntention>({
    if_part: "",
    then_part: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: toolboxData } = useQuery({
    queryKey: ["habit-toolboxes", habitId, "intentions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("habit_toolboxes")
        .select("*")
        .eq("user_id", user.id)
        .eq("habit_id", habitId)
        .eq("type", "intentions");

      return data || [];
    }
  });

  useEffect(() => {
    if (toolboxData && toolboxData.length > 0) {
      try {
        const storedIntentions = toolboxData[0].steps;
        if (Array.isArray(storedIntentions) && storedIntentions.length > 0) {
          const parsedIntentions = storedIntentions.map(step => {
            try {
              return JSON.parse(step);
            } catch (e) {
              // If the step is not valid JSON, return a default object
              return { if_part: step, then_part: "" };
            }
          });
          setIntentions(parsedIntentions);
        }
      } catch (error) {
        console.error("Error parsing intentions:", error);
      }
    }
  }, [toolboxData]);

  const saveIntentionsMutation = useMutation({
    mutationFn: async (updatedIntentions: ImplementationIntention[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Serialize intentions to store as string array
      const intentionsAsStringArray = updatedIntentions.map(intention => 
        JSON.stringify(intention)
      );

      // Check if toolbox record exists
      if (toolboxData && toolboxData.length > 0) {
        const { data, error } = await supabase
          .from("habit_toolboxes")
          .update({
            steps: intentionsAsStringArray
          })
          .eq("id", toolboxData[0].id);

        if (error) throw error;
        return data;
      } else {
        // Create new toolbox record
        const { data, error } = await supabase
          .from("habit_toolboxes")
          .insert({
            user_id: user.id,
            habit_id: habitId,
            title: "Wenn-Dann-Pläne",
            description: "Implementationsintentionen für deine Gewohnheit",
            type: "intentions",
            category: "Implementation",
            steps: intentionsAsStringArray
          });

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-toolboxes"] });
      toast({
        title: "Wenn-Dann-Pläne gespeichert",
        description: "Deine Implementationsintentionen wurden erfolgreich gespeichert."
      });
    }
  });

  const handleAddIntention = () => {
    if (newIntention.if_part.trim() && newIntention.then_part.trim()) {
      const updatedIntentions = [...intentions, newIntention];
      setIntentions(updatedIntentions);
      setNewIntention({ if_part: "", then_part: "" });
      saveIntentionsMutation.mutate(updatedIntentions);
    } else {
      toast({
        title: "Felder ausfüllen",
        description: "Bitte fülle beide Felder aus.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveIntention = (index: number) => {
    const updatedIntentions = intentions.filter((_, i) => i !== index);
    setIntentions(updatedIntentions);
    saveIntentionsMutation.mutate(updatedIntentions);
  };

  const handleChangeIfPart = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewIntention({ ...newIntention, if_part: e.target.value });
  };

  const handleChangeThenPart = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewIntention({ ...newIntention, then_part: e.target.value });
  };

  return (
    <Card className="shadow-sm border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-blue-800">{title}</CardTitle>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {intentions.length > 0 ? (
            <div className="space-y-2">
              {intentions.map((intention, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-blue-50 rounded-md"
                >
                  <div className="grow">
                    <p>
                      <span className="font-medium">Wenn: </span>
                      {intention.if_part}
                    </p>
                    <p>
                      <span className="font-medium">Dann: </span>
                      {intention.then_part}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveIntention(index)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-md">
              <p>Noch keine Wenn-Dann-Pläne erstellt</p>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div>
              <div className="mb-1 text-sm font-medium">Wenn:</div>
              <Input
                placeholder="z.B.: Wenn ich morgens aufstehe..."
                value={newIntention.if_part}
                onChange={handleChangeIfPart}
              />
            </div>
            <div>
              <div className="mb-1 text-sm font-medium">Dann:</div>
              <Input
                placeholder="z.B.: ...trinke ich ein Glas Wasser."
                value={newIntention.then_part}
                onChange={handleChangeThenPart}
              />
            </div>
            <Button
              variant="outline"
              className="w-full border-dashed border-blue-200 text-blue-600"
              onClick={handleAddIntention}
            >
              <Plus className="h-4 w-4 mr-1" /> Wenn-Dann-Plan hinzufügen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
