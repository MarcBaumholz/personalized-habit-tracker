
import { useState } from "react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { CATEGORY_EMOJIS } from "@/constants/todoConstants";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function Archive() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const { data: archivedTodos } = useQuery({
    queryKey: ["archived-todos-all"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data } = await supabase
        .from("archived_todos")
        .select("*")
        .eq("user_id", user.id)
        .order("archived_at", { ascending: false });

      return data;
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    navigate(-1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Todo-Archiv</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          <div className="space-y-4 pr-4">
            {archivedTodos?.map((todo) => (
              <Card key={todo.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_EMOJIS[todo.category || "Sonstiges"]}</span>
                      <span className="font-medium">{todo.title}</span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        Archiviert am:{" "}
                        {todo.archived_at
                          ? format(new Date(todo.archived_at), "dd.MM.yyyy 'um' HH:mm 'Uhr'")
                          : "Unbekannt"}
                      </p>
                      {todo.completion_date && (
                        <p>
                          Abgeschlossen am:{" "}
                          {format(new Date(todo.completion_date), "dd.MM.yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      todo.completed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {todo.completed ? "Erledigt" : "Nicht erledigt"}
                  </span>
                </div>
              </Card>
            ))}
            {(!archivedTodos || archivedTodos.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                Keine archivierten Todos gefunden
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
