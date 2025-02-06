import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Trash2, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Arbeit",
  "Persönlich",
  "Gesundheit",
  "Einkaufen",
  "Sonstiges",
];

export const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
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
        category: selectedCategory,
        scheduled_time: selectedTime || null,
        priority: (todos?.length || 0) + 1,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      setNewTodo("");
      setSelectedCategory("");
      setSelectedTime("");
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

  const deleteTodoMutation = useMutation({
    mutationFn: async (todoId: string) => {
      const { error } = await supabase
        .from("todos")
        .delete()
        .eq("id", todoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({
        title: "Todo gelöscht",
        description: "Das Todo wurde erfolgreich gelöscht.",
      });
    },
  });

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Top Todos für heute</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
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
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-[150px]"
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
        </div>

        <div className="space-y-2">
          {todos?.map((todo: any) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/20"
            >
              <div className="flex flex-col">
                <span className={todo.completed ? "line-through text-muted-foreground" : ""}>
                  {todo.title}
                </span>
                <div className="flex gap-2 text-xs text-gray-500">
                  {todo.category && (
                    <span className="bg-gray-100 px-2 py-0.5 rounded">
                      {todo.category}
                    </span>
                  )}
                  {todo.scheduled_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {todo.scheduled_time}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTodoMutation.mutate(todo)}
                >
                  <Check className={`h-4 w-4 ${todo.completed ? "text-green-500" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodoMutation.mutate(todo.id)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};