
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
    : (isBlocked ? '' : 'hover:bg-gray-50');

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
      {hasItems ? (
        <div className="absolute inset-0 p-0">
          {matchingSchedules.map(schedule => (
            <div
              key={`schedule-${schedule.id}`}
              className="h-full w-full bg-blue-100 border-blue-200 flex flex-col justify-center px-3 py-2"
            >
              <div className="font-medium text-sm text-blue-800">
                {schedule.habits?.name || "Gewohnheit"}
              </div>
              {schedule.habits?.category && (
                <div className="text-xs text-blue-600 mt-1">
                  {schedule.habits.category}
                </div>
              )}
            </div>
          ))}
          
          {matchingTodos.map(todo => (
            <div
              key={`todo-${todo.id}`}
              className="h-full w-full bg-green-100 border-green-200 flex flex-col justify-center px-3 py-2"
            >
              <div className="font-medium text-sm text-green-800">
                {todo.title || "Todo"}
              </div>
              {todo.category && (
                <div className="text-xs text-green-600 mt-1">
                  {todo.category}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-6 w-6 text-blue-400" />
        </div>
      )}
    </div>
  );
};
