import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { HabitDetailHeader } from "@/components/habits/detail/HabitDetailHeader";
import { HabitDetailForm } from "@/components/habits/detail/HabitDetailForm";
import { HabitReflection } from "@/components/habits/detail/HabitReflection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitToolbox } from "@/components/habits/HabitToolbox";
import { HabitToolboxes } from "@/components/habits/detail/HabitToolboxes";
import { useState } from "react";
import { PastReflections } from "@/components/habits/detail/PastReflections";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const HabitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeToolboxType, setActiveToolboxType] = useState("intentions");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: habit, isLoading, refetch: refetchHabit } = useQuery({
    queryKey: ["habit", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habits")
        .select("*, habit_completions(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: toolboxes, refetch: refetchToolboxes } = useQuery({
    queryKey: ["habit-toolboxes", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("habit_toolboxes")
        .select("*")
        .eq("habit_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: reflections } = useQuery({
    queryKey: ["habit-reflections", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habit_reflections")
        .select("*")
        .eq("habit_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Delete habit mutation
  const deleteHabitMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No habit ID");
      
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      toast.success("Gewohnheit erfolgreich gelöscht");
      navigate("/");
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Gewohnheit");
    }
  });

  const handleToolboxUpdate = () => {
    refetchToolboxes();
  };

  const handleToolboxTabChange = (value: string) => {
    setActiveToolboxType(value);
  };

  const calculateProgress = (habit: any) => {
    const completions = habit?.habit_completions?.length || 0;
    return Math.round((completions / 66) * 100);
  };

  const handleDeleteHabit = () => {
    deleteHabitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Loading...</div>
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="container max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">Gewohnheit nicht gefunden</h2>
            <p className="text-gray-600">Die angeforderte Gewohnheit existiert nicht oder du hast keinen Zugriff.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container max-w-7xl mx-auto py-6 px-4">
        {/* Header with full-width 66-day progress and compact action buttons */}
        <div className="mb-6">
          <HabitDetailHeader 
            habitName={habit.name} 
            progress={calculateProgress(habit)}
            streak={habit.streak_count || 0}
            habitId={id}
          />
          
          {/* Compact action buttons row */}
          <div className="flex justify-end items-center gap-2 mt-4">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Gewohnheit löschen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bist du sicher, dass du diese Gewohnheit löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteHabit}>Löschen</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Main content with tabs navigation */}
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="edit">Bearbeiten</TabsTrigger>
            <TabsTrigger value="tools">Werkzeuge</TabsTrigger>
            <TabsTrigger value="checkin">Check-in</TabsTrigger>
            <TabsTrigger value="reflections">Reflexionen</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-6">
            <HabitDetailForm habit={habit} id={id} onUpdate={refetchHabit} />
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-6">
            <HabitToolbox 
              habitId={id || ""} 
              onUpdate={handleToolboxUpdate}
              activeTab={activeToolboxType}
              onTabChange={handleToolboxTabChange}
            />
            <HabitToolboxes 
              toolboxes={toolboxes || []} 
              habitId={id || ""} 
              onToolboxUpdate={handleToolboxUpdate}
            />
          </TabsContent>
          
          <TabsContent value="checkin" className="space-y-6">
            <HabitReflection habitId={id || ""} />
          </TabsContent>
          
          <TabsContent value="reflections" className="space-y-6">
            <PastReflections reflections={reflections || []} habitId={id || ""} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default HabitDetail;
