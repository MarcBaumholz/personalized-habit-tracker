
import { useDraggable } from "@dnd-kit/core";
import { CalendarClock } from "lucide-react";

interface DraggableScheduleItemProps {
  todo: {
    id: string;
    title: string;
    scheduled_time?: string;
    category?: string;
  };
  isHabit?: boolean;
  onDoubleClick?: () => void;
}

export const DraggableScheduleItem = ({ 
  todo, 
  isHabit = false, 
  onDoubleClick 
}: DraggableScheduleItemProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
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
      onDoubleClick={onDoubleClick}
      className={`flex items-center gap-4 p-3 border rounded-lg cursor-move transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100'}
        ${isHabit ? 'bg-blue-50 hover:bg-blue-100 border-blue-200' : 
          todo.scheduled_time ? 'bg-green-50 hover:bg-green-100 border-green-200' : 
          'hover:bg-gray-50 border-gray-200'}
        ${onDoubleClick ? 'hover:shadow-md' : ''}
      `}
    >
      {todo.scheduled_time ? (
        <span className="font-medium min-w-[60px] flex items-center">
          <CalendarClock className="h-4 w-4 mr-1 text-blue-600" />
          {todo.scheduled_time}
        </span>
      ) : (
        <span className="text-sm text-gray-500 italic min-w-[60px]">Nicht geplant</span>
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{todo.title}</span>
          {todo.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
              {todo.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
