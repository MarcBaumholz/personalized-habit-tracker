import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const ReflectionQuestions = () => {
  const [newQuestion, setNewQuestion] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: questions } = useQuery({
    queryKey: ["reflection-questions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("reflection_questions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      return data || [];
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (question: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("reflection_questions")
        .insert({
          user_id: user.id,
          question,
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflection-questions"] });
      setNewQuestion("");
      toast({
        title: "Frage hinzugefügt",
        description: "Deine Reflexionsfrage wurde gespeichert.",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reflection_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reflection-questions"] });
      toast({
        title: "Frage gelöscht",
        description: "Die Reflexionsfrage wurde entfernt.",
      });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Neue Reflexionsfrage hinzufügen"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <Button
          onClick={() => addQuestionMutation.mutate(newQuestion)}
          disabled={!newQuestion.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        {questions?.map((q) => (
          <div key={q.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>{q.question}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteQuestionMutation.mutate(q.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};