import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Plus } from "lucide-react";

export interface Todo {
  id: string;
  title: string;
  scheduled_time?: string;
  scheduled_date?: string;
  position_x?: number;
  position_y?: number;
}

export interface Habit {
  id: string;
  name: string;
  category?: string;
}

export interface ScheduleListProps {
  date?: Date;
  schedules?: any[];
  todos?: any[];
  habits?: any[];
  isDraggable?: boolean;
  onScheduleTodo?: (todo: any, time: string, day: Date) => void;
  onScheduleHabit?: (habit: any, time: string, day: Date) => void;
}

const DraggableItem = ({ id, children, type }: { id: string; children: React.ReactNode; type: string }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      type
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
};

export const ScheduleList: React.FC<ScheduleListProps> = ({
  date = new Date(),
  schedules = [],
  todos = [],
  habits = [],
  isDraggable = false,
  onScheduleTodo,
  onScheduleHabit
}) => {
  const formattedDate = format(date, "EEEE, dd.MM.yyyy", { locale: de });
  
  // Filter schedules for the selected date
  const todaySchedules = schedules?.filter(schedule => 
    format(new Date(schedule.scheduled_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  ) || [];
  
  // Filter todos that are scheduled for today
  const todayTodos = todos?.filter(todo => 
    todo.scheduled_date && format(new Date(todo.scheduled_date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
  ) || [];
  
  // Filter todos that are not scheduled
  const unscheduledTodos = todos?.filter(todo => !todo.scheduled_date) || [];

  const handleScheduleTodo = (todo: any) => {
    if (onScheduleTodo) {
      onScheduleTodo(todo, "09:00", date);
    }
  };

  const handleScheduleHabit = (habit: any) => {
    if (onScheduleHabit) {
      onScheduleHabit(habit, "09:00", date);
    }
  };

  return (
    <Card className="shadow-sm border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-blue-800">
          Zeitplan für {formattedDate}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="scheduled">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="scheduled">Geplant</TabsTrigger>
            <TabsTrigger value="habits">Gewohnheiten</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="scheduled" className="space-y-3">
            {todaySchedules.length > 0 || todayTodos.length > 0 ? (
              <>
                {todaySchedules.map(schedule => (
                  <div key={schedule.id} className="p-3 bg-blue-50 rounded-md">
                    {isDraggable ? (
                      <DraggableItem id={schedule.id} type="habit">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{schedule.habits?.name || "Gewohnheit"}</p>
                            <p className="text-sm text-gray-600">{schedule.scheduled_time || "Keine Zeit"} Uhr</p>
                          </div>
                          <div className="text-xs px-2 py-1 bg-blue-100 rounded-full">Gewohnheit</div>
                        </div>
                      </DraggableItem>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{schedule.habits?.name || "Gewohnheit"}</p>
                          <p className="text-sm text-gray-600">{schedule.scheduled_time || "Keine Zeit"} Uhr</p>
                        </div>
                        <div className="text-xs px-2 py-1 bg-blue-100 rounded-full">Gewohnheit</div>
                      </div>
                    )}
                  </div>
                ))}
                
                {todayTodos.map(todo => (
                  <div key={todo.id} className="p-3 bg-green-50 rounded-md">
                    {isDraggable ? (
                      <DraggableItem id={todo.id} type="todo">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{todo.title}</p>
                            <p className="text-sm text-gray-600">{todo.scheduled_time || "Keine Zeit"} Uhr</p>
                          </div>
                          <div className="text-xs px-2 py-1 bg-green-100 rounded-full">Todo</div>
                        </div>
                      </DraggableItem>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{todo.title}</p>
                          <p className="text-sm text-gray-600">{todo.scheduled_time || "Keine Zeit"} Uhr</p>
                        </div>
                        <div className="text-xs px-2 py-1 bg-green-100 rounded-full">Todo</div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>Keine Termine für heute</p>
                <p className="text-sm">Plane Gewohnheiten oder Todos</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="habits" className="space-y-3">
            {habits && habits.length > 0 ? (
              <>
                {habits.map(habit => (
                  <div 
                    key={habit.id} 
                    className="p-3 bg-blue-50 rounded-md flex justify-between items-center hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleScheduleHabit(habit)}
                  >
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-xs text-gray-600">{habit.category || "Keine Kategorie"}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Keine Gewohnheiten verfügbar</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="todos" className="space-y-3">
            {unscheduledTodos.length > 0 ? (
              <>
                {unscheduledTodos.map(todo => (
                  <div 
                    key={todo.id} 
                    className="p-3 bg-green-50 rounded-md flex justify-between items-center hover:bg-green-100 cursor-pointer"
                    onClick={() => handleScheduleTodo(todo)}
                  >
                    <p className="font-medium">{todo.title}</p>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>Keine offenen Todos verfügbar</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScheduleList;
