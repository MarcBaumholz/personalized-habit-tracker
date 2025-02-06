
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Check, Trash2, Sparkles } from "lucide-react";
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

const CATEGORY_EMOJIS: { [key: string]: string } = {
  "Arbeit": "💼",
  "Persönlich": "🎯",
  "Gesundheit": "🏃‍♂️",
  "Einkaufen": "🛍️",
  "Sonstiges": "✨",
};

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
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Todos für heute</h2>
      </div>
      
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Neues Todo hinzufügen..."
              className="flex-1 border-2 border-gray-200 focus:border-primary/50 transition-colors"
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
              className="bg-primary hover:bg-primary/90 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="hidden">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_EMOJIS[category]} {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          {todos?.map((todo: any) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                todo.completed 
                  ? "bg-gray-50 opacity-75" 
                  : "bg-white hover:shadow-md hover:scale-[1.01]"
              } border border-gray-100`}
            >
              <div className="flex items-center gap-2">
                <span className={`${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                  {CATEGORY_EMOJIS[todo.category || "Sonstiges"]} {todo.title}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTodoMutation.mutate(todo)}
                  className={`hover:bg-green-50 ${todo.completed ? "text-green-500" : ""}`}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodoMutation.mutate(todo.id)}
                  className="text-destructive hover:text-destructive/90 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {(!todos || todos.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-4xl mb-2">✨</p>
              <p>Keine Todos für heute</p>
              <p className="text-sm">Füge ein neues Todo hinzu, um produktiv zu sein!</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
