import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todos } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("priority", { ascending: true })
        .limit(5);

      return data;
    },
  });

  const addTodoMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase.from("todos").insert({
        user_id: user.id,
        title,
        priority: (todos?.length || 0) + 1,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
      toast({
        title: "Todo hinzugefügt",
        description: "Dein neues Todo wurde erfolgreich erstellt.",
      });
    },
  });

  const toggleTodoMutation = useMutation({
    mutationFn: async (todo: any) => {
      const { data, error } = await supabase
        .from("todos")
        .update({ completed: !todo.completed })
        .eq("id", todo.id);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Top Todos für heute</h2>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Neues Todo hinzufügen..."
            onKeyPress={(e) => {
              if (e.key === "Enter" && newTodo.trim()) {
                addTodoMutation.mutate(newTodo.trim());
              }
            }}
          />
          <Button
            onClick={() => {
              if (newTodo.trim()) {
                addTodoMutation.mutate(newTodo.trim());
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {todos?.map((todo: any) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/20"
            >
              <span className={todo.completed ? "line-through text-muted-foreground" : ""}>
                {todo.title}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleTodoMutation.mutate(todo)}
              >
                <Check className={`h-4 w-4 ${todo.completed ? "text-primary" : ""}`} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};