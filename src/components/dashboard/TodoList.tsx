
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TodoHeader } from "./TodoHeader";
import { TodoInput } from "./TodoInput";
import { TodoItem } from "./TodoItem";
import { EmptyTodoState } from "./EmptyTodoState";

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

const INSPIRATIONAL_MESSAGES = [
  "Starte deinen Tag mit 3-5 wichtigen Todos! 🌟",
  "Plane deine Erfolge für heute - setze dir 3-5 Ziele! 🎯",
  "Ein produktiver Tag beginnt mit klaren Zielen. Definiere 3-5 Todos! ✨",
  "Welche 3-5 Aufgaben würden deinen Tag erfolgreich machen? 💫",
  "Zeit, deine Top-Prioritäten für heute festzulegen! 🚀",
];

export const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const updateTimeUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilMidnight(`${hours}h ${minutes}m`);
    };

    updateTimeUntilMidnight();
    const interval = setInterval(updateTimeUntilMidnight, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const getRandomMessage = () => {
    const randomIndex = Math.floor(Math.random() * INSPIRATIONAL_MESSAGES.length);
    return INSPIRATIONAL_MESSAGES[randomIndex];
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg">
      <TodoHeader timeUntilMidnight={timeUntilMidnight} />
      
      <div className="space-y-4">
        <TodoInput
          newTodo={newTodo}
          setNewTodo={setNewTodo}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          onAddTodo={() => {
            if (newTodo.trim()) {
              addTodoMutation.mutate(newTodo.trim());
            }
          }}
          categories={CATEGORIES}
          categoryEmojis={CATEGORY_EMOJIS}
        />

        <div className="space-y-2">
          {todos?.map((todo: any) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              categoryEmojis={CATEGORY_EMOJIS}
              onToggle={toggleTodoMutation.mutate}
              onDelete={deleteTodoMutation.mutate}
            />
          ))}
          
          {(!todos || todos.length === 0) && (
            <EmptyTodoState getMessage={getRandomMessage} />
          )}
        </div>
      </div>
    </Card>
  );
};
