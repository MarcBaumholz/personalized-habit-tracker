
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TodoHeader } from "./TodoHeader";
import { TodoInput } from "./TodoInput";
import { TodoItem } from "./TodoItem";
import { EmptyTodoState } from "./EmptyTodoState";
import { useTodos } from "@/hooks/useTodos";
import { CATEGORIES, CATEGORY_EMOJIS, INSPIRATIONAL_MESSAGES } from "@/constants/todoConstants";
import { Separator } from "@/components/ui/separator";

export const TodoList = () => {
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");
  const { todos, archivedTodos, addTodo, toggleTodo, deleteTodo } = useTodos();

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

  const handleAddTodo = () => {
    if (newTodo.trim()) {
      addTodo({
        title: newTodo.trim(),
        category: selectedCategory,
        scheduled_time: selectedTime || null,
      });
      setNewTodo("");
      setSelectedCategory("");
      setSelectedTime("");
    }
  };

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
          onAddTodo={handleAddTodo}
          categories={CATEGORIES}
          categoryEmojis={CATEGORY_EMOJIS}
        />

        <div className="space-y-2">
          {todos?.map((todo: any) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              categoryEmojis={CATEGORY_EMOJIS}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))}
          
          {(!todos || todos.length === 0) && (
            <EmptyTodoState getMessage={getRandomMessage} />
          )}
        </div>

        {archivedTodos && archivedTodos.length > 0 && (
          <div className="mt-6">
            <Separator className="my-4" />
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Todos von gestern
            </h3>
            <div className="space-y-2 opacity-75">
              {archivedTodos.map((todo: any) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <span className="text-gray-600">
                    {CATEGORY_EMOJIS[todo.category || "Sonstiges"]} {todo.title}
                  </span>
                  <span className="text-xs text-gray-400">
                    {todo.completed ? "Erledigt" : "Nicht erledigt"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
