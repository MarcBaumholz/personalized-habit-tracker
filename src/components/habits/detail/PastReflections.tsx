
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Reflection {
  id: string;
  habit_id: string;
  user_id: string;
  reflection_text: string;
  srhi_score?: number;
  created_at: string;
}

interface PastReflectionsProps {
  reflections: Reflection[];
  habitId: string;
}

export const PastReflections = ({ reflections, habitId }: PastReflectionsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateReflectionMutation = useMutation({
    mutationFn: async ({ id, text }: { id: string; text: string }) => {
      const { error } = await supabase
        .from("habit_reflections")
        .update({ reflection_text: text })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-reflections", habitId] });
      toast({
        title: "Reflexion aktualisiert",
        description: "Deine Reflexion wurde erfolgreich aktualisiert.",
      });
      setEditingId(null);
    },
  });

  const deleteReflectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("habit_reflections")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-reflections", habitId] });
      toast({
        title: "Reflexion gelöscht",
        description: "Deine Reflexion wurde erfolgreich gelöscht.",
      });
    },
  });

  const handleEdit = (reflection: Reflection) => {
    setEditingId(reflection.id);
    setEditedText(reflection.reflection_text);
  };

  const handleSave = (id: string) => {
    if (editedText.trim()) {
      updateReflectionMutation.mutate({ id, text: editedText });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Möchtest du diese Reflexion wirklich löschen?")) {
      deleteReflectionMutation.mutate(id);
    }
  };

  if (!reflections || reflections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vergangene Reflexionen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
            Du hast noch keine Reflexionen eingetragen.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vergangene Reflexionen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reflections.map((reflection) => (
            <div key={reflection.id} className="p-4 bg-gray-50 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {format(new Date(reflection.created_at), "d. MMMM", { locale: de })}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(reflection.created_at), "HH:mm")}
                </span>
              </div>
              
              {editingId === reflection.id ? (
                <div className="space-y-2">
                  <Textarea 
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="h-20 mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                      Abbrechen
                    </Button>
                    <Button size="sm" onClick={() => handleSave(reflection.id)}>
                      Speichern
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 mb-2">{reflection.reflection_text}</p>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(reflection)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(reflection.id)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Löschen
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
