
import { useDraggable } from "@dnd-kit/core";

interface DraggableScheduleItemProps {
  todo: {
    id: string;
    title: string;
    scheduled_time?: string;
    category?: string;
  };
  isHabit?: boolean;
}

export const DraggableScheduleItem = ({ todo, isHabit = false }: DraggableScheduleItemProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: todo.id,
    data: { 
      type: isHabit ? 'habit' : 'todo', 
      ...todo 
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-4 p-3 border rounded-lg cursor-move transition-colors
        ${isHabit ? 'bg-blue-50 hover:bg-blue-100' : todo.scheduled_time ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}`}
    >
      <span className="font-medium min-w-[60px]">
        {todo.scheduled_time || "---"}
      </span>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span>{todo.title}</span>
          {todo.category && (
            <span className="text-sm text-gray-500">{todo.category}</span>
          )}
        </div>
      </div>
    </div>
  );
};
