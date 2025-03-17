
import React from "react";
import { format } from "date-fns";
import { useDroppable } from "@dnd-kit/core";
import { Plus, Lock } from "lucide-react";

interface TimeCellProps {
  day: Date;
  time: string;
  schedules: any[];
  todos: any[];
  onClick: (time: string, day: Date) => void;
  isSelected: boolean;
}

export const TimeCell: React.FC<TimeCellProps> = ({
  day,
  time,
  schedules,
  todos,
  onClick,
  isSelected
}) => {
  const droppableId = `${time}-${0}:${0}`;
  const { setNodeRef } = useDroppable({
    id: droppableId
  });

  const matchingSchedules = schedules.filter(schedule => 
    format(new Date(schedule.scheduled_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd") &&
    schedule.scheduled_time === time
  );

  const matchingTodos = todos.filter(todo => 
    todo.scheduled_time === time && 
    format(new Date(todo.scheduled_date || new Date()), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
  );

  const hasItems = matchingSchedules.length > 0 || matchingTodos.length > 0;
  const isBlocked = hasItems;
  
  const bgClass = isSelected 
    ? 'bg-blue-100 border-2 border-blue-400' 
    : (isBlocked ? 'bg-green-50' : 'hover:bg-gray-50');

  const handleClick = () => {
    if (!isBlocked) {
      onClick(time, day);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`border-b border-r h-20 group relative ${bgClass} ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors`}
      onClick={handleClick}
    >
      {matchingSchedules.map(schedule => (
        <div
          key={`schedule-${schedule.id}`}
          style={{
            position: 'absolute',
            left: `${schedule.position_x || 5}px`,
            top: `${schedule.position_y || 5}px`
          }}
          className="px-3 py-1 text-sm bg-blue-100 border border-blue-200 rounded-md shadow-sm"
        >
          {schedule.habits?.name || "Gewohnheit"}
        </div>
      ))}
      
      {matchingTodos.map(todo => (
        <div
          key={`todo-${todo.id}`}
          style={{
            position: 'absolute',
            left: `${todo.position_x || 5}px`,
            top: `${(todo.position_y || 5) + 30}px`
          }}
          className="px-3 py-1 text-sm bg-green-100 border border-green-200 rounded-md shadow-sm"
        >
          {todo.title || "Todo"}
        </div>
      ))}

      {isBlocked ? (
        <div className="absolute inset-0 flex items-center justify-center opacity-50">
          <Lock className="h-5 w-5 text-gray-500" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-6 w-6 text-blue-400" />
        </div>
      )}
    </div>
  );
};
