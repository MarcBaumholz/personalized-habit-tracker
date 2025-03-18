
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

  const formattedDate = format(day, "yyyy-MM-dd");

  const matchingSchedules = schedules.filter(schedule => 
    format(new Date(schedule.scheduled_date), "yyyy-MM-dd") === formattedDate &&
    schedule.scheduled_time === time
  );

  const matchingTodos = todos.filter(todo => 
    todo.scheduled_time === time && 
    format(new Date(todo.scheduled_date || new Date()), "yyyy-MM-dd") === formattedDate
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

  console.log(`TimeCell: ${formattedDate} ${time}`, { matchingSchedules, matchingTodos, hasItems });

  return (
    <div
      ref={setNodeRef}
      className={`border-b border-r h-20 group relative ${bgClass} ${isBlocked ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors`}
      onClick={handleClick}
      data-has-items={hasItems ? 'true' : 'false'}
    >
      {hasItems && (
        <div className="absolute inset-0 p-1 flex flex-col gap-1 overflow-y-auto">
          {matchingSchedules.map(schedule => (
            <div
              key={`schedule-${schedule.id}`}
              className="px-2 py-1 text-xs bg-blue-100 border border-blue-200 rounded-md shadow-sm flex items-center"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
              <span className="truncate">{schedule.habits?.name || "Gewohnheit"}</span>
            </div>
          ))}
          
          {matchingTodos.map(todo => (
            <div
              key={`todo-${todo.id}`}
              className="px-2 py-1 text-xs bg-green-100 border border-green-200 rounded-md shadow-sm flex items-center"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span className="truncate">{todo.title || "Todo"}</span>
            </div>
          ))}
        </div>
      )}

      {isBlocked ? (
        <div className="absolute bottom-1 right-1 opacity-50">
          <Lock className="h-4 w-4 text-gray-500" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-6 w-6 text-blue-400" />
        </div>
      )}
    </div>
  );
};
