
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TodoHeader } from "./TodoHeader";
import { TodoInput } from "./TodoInput";
import { TodoItem } from "./TodoItem";
import { EmptyTodoState } from "./EmptyTodoState";
import { useTodos } from "@/hooks/useTodos";
import { CATEGORIES, CATEGORY_EMOJIS, INSPIRATIONAL_MESSAGES } from "@/constants/todoConstants";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Archive, SmileIcon } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export const TodoList = () => {
  const navigate = useNavigate();
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeUntilMidnight, setTimeUntilMidnight] = useState("");
  const [showArchive, setShowArchive] = useState(false);
  const { todos, archivedTodos, todoStats, addTodo, toggleTodo, deleteTodo } = useTodos();

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

  const getFeedbackMessage = () => {
    if (!todoStats) return "";
    
    const { completed_todos, total_todos } = todoStats;
    const completionRate = total_todos > 0 ? (completed_todos / total_todos) * 100 : 0;

    if (total_todos === 0) {
      return "Willkommen! Beginne deinen Tag mit einem neuen Todo.";
    }

    if (completionRate >= 80) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <SmileIcon className="h-5 w-5" />
          <span>Super Leistung! Du hast {completed_todos} von {total_todos} Todos geschafft!</span>
        </div>
      );
    }

    if (completionRate >= 50) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <SmileIcon className="h-5 w-5" />
          <span>Gute Arbeit! Weiter so mit den restlichen Todos!</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-blue-600">
        <SmileIcon className="h-5 w-5" />
        <span>Jeder Fortschritt zählt! Du schaffst das!</span>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-gray-50 shadow-lg">
      <TodoHeader timeUntilMidnight={timeUntilMidnight} />
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          {getFeedbackMessage()}
        </div>

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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">
                Archivierte Todos
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowArchive(!showArchive)}
                className="text-gray-500 hover:bg-gray-100"
              >
                {showArchive ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {showArchive && (
              <div className="space-y-2 opacity-75">
                {archivedTodos.map((todo: any) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-600">
                        {CATEGORY_EMOJIS[todo.category || "Sonstiges"]} {todo.title}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(todo.archived_at), 'dd.MM.yyyy HH:mm')} Uhr
                      </span>
                    </div>
                    <span className={`text-xs ${todo.completed ? "text-green-500" : "text-red-500"}`}>
                      {todo.completed ? "Erledigt" : "Nicht erledigt"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
            onClick={() => navigate("/archive")}
          >
            <Archive className="h-4 w-4" />
            Zum vollständigen Archiv
          </Button>
        </div>
      </div>
    </Card>
  );
};

