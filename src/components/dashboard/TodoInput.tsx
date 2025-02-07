
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodoInputProps {
  newTodo: string;
  setNewTodo: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedTime: string;
  setSelectedTime: (value: string) => void;
  onAddTodo: () => void;
  categories: string[];
  categoryEmojis: { [key: string]: string };
}

export const TodoInput = ({
  newTodo,
  setNewTodo,
  selectedCategory,
  setSelectedCategory,
  selectedTime,
  setSelectedTime,
  onAddTodo,
  categories,
  categoryEmojis,
}: TodoInputProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Neues Todo hinzufügen..."
          className="flex-1 border-2 border-gray-200 focus:border-primary/50 transition-colors"
          onKeyPress={(e) => {
            if (e.key === "Enter" && newTodo.trim()) {
              onAddTodo();
            }
          }}
        />
        <Button
          onClick={() => {
            if (newTodo.trim()) {
              onAddTodo();
            }
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="hidden">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Kategorie" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {categoryEmojis[category]} {category}
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
  );
};
