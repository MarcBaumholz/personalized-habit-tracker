
import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TodoItemProps {
  todo: {
    id: string;
    title: string;
    completed: boolean;
    category?: string;
  };
  categoryEmojis: { [key: string]: string };
  onToggle: (todo: any) => void;
  onDelete: (id: string) => void;
}

export const TodoItem = ({ todo, categoryEmojis, onToggle, onDelete }: TodoItemProps) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
        todo.completed 
          ? "bg-gray-50 opacity-75" 
          : "bg-white hover:shadow-md hover:scale-[1.01]"
      } border border-gray-100`}
    >
      <div className="flex items-center gap-2">
        <span className={`${todo.completed ? "line-through text-muted-foreground" : ""}`}>
          {categoryEmojis[todo.category || "Sonstiges"]} {todo.title}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(todo)}
          className={`hover:bg-green-50 ${todo.completed ? "text-green-500" : ""}`}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(todo.id)}
          className="text-destructive hover:text-destructive/90 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
