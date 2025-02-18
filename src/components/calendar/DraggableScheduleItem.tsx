
import { useDraggable } from "@dnd-kit/core";

interface DraggableScheduleItemProps {
  todo: {
    id: string;
    title: string;
    scheduled_time?: string;
    category?: string;
  };
}

export const DraggableScheduleItem = ({ todo }: DraggableScheduleItemProps) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: todo.id,
    data: { type: 'todo', ...todo }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-colors
        ${todo.scheduled_time ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
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
