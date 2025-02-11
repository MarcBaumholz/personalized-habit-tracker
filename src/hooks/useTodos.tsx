
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TodoStats {
  completed_todos: number;
  incomplete_todos: number;
  total_todos: number;
}

export const useTodos = () => {
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

  const { data: todoStats } = useQuery({
    queryKey: ["todo-stats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .rpc('get_last_24h_todo_stats', { p_user_id: user.id });

      // Since we know the RPC function returns a JSON object with the correct shape,
      // we can safely cast it after checking it's an object
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data as TodoStats;
      }
      
      // Return default values if data is not in expected format
      return {
        completed_todos: 0,
        incomplete_todos: 0,
        total_todos: 0
      };
    },
  });

  const { data: archivedTodos } = useQuery({
    queryKey: ["archived-todos"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from("archived_todos")
        .select("*")
        .eq("user_id", user.id)
        .eq("completion_date", today)
        .order("archived_at", { ascending: false });

      return data;
    },
  });

  const addTodoMutation = useMutation({
    mutationFn: async (todo: { title: string; category: string; scheduled_time: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase.from("todos").insert({
        user_id: user.id,
        title: todo.title,
        category: todo.category,
        scheduled_time: todo.scheduled_time,
        priority: (todos?.length || 0) + 1,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
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

  return {
    todos,
    archivedTodos,
    todoStats,
    addTodo: addTodoMutation.mutate,
    toggleTodo: toggleTodoMutation.mutate,
    deleteTodo: deleteTodoMutation.mutate,
  };
};
