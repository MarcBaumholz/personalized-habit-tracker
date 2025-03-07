import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/layout/Navigation";
import { HabitDetailHeader } from "@/components/habits/detail/HabitDetailHeader";
import { HabitDetailForm } from "@/components/habits/detail/HabitDetailForm";
import { HabitSchedules } from "@/components/habits/detail/HabitSchedules";
import { HabitOverview } from "@/components/habits/detail/HabitOverview";
import { HabitToolboxes } from "@/components/habits/detail/HabitToolboxes";
import { HabitReflection } from "@/components/habits/detail/HabitReflection";
import { PastReflections } from "@/components/habits/detail/PastReflections";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HabitFormationTracker } from "@/components/habits/HabitFormationTracker";
import { HabitToolbox } from "@/components/habits/HabitToolbox";

const HabitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  
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

  const handleToolboxUpdate = () => {
    refetchToolboxes();
  };

  const { data: schedules } = useQuery({
    queryKey: ["habit-schedules", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("habit_schedules")
        .select("*")
        .eq("habit_id", id);

      if (error) throw error;
      return data || [];
    },
  });

  const calculateProgress = (habit: any) => {
    const completions = habit?.habit_completions?.length || 0;
    return Math.round((completions / 66) * 100);
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
        <HabitDetailHeader 
          habitName={habit.name} 
          progress={calculateProgress(habit)} 
        />

        {isMobile ? (
          <Tabs defaultValue="details" className="mb-12">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="planning">Planung</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <HabitDetailForm habit={habit} id={id} onUpdate={refetchHabit} />
              <HabitFormationTracker 
                streak={habit.streak_count || 0} 
                habitName={habit.name} 
              />
              <HabitOverview 
                identity={habit.identity || ""} 
                context={habit.context || ""} 
                smartGoal={habit.smart_goal || ""}
                frequency={habit.frequency}
                category={habit.category}
                streakCount={habit.streak_count}
                difficulty={habit.difficulty}
              />
            </TabsContent>
            
            <TabsContent value="tracking" className="space-y-6">
              <HabitReflection habitId={id || ""} />
              <PastReflections />
            </TabsContent>
            
            <TabsContent value="planning" className="space-y-6">
              <HabitSchedules schedules={schedules || []} />
              <HabitToolbox habitId={id || ""} onUpdate={handleToolboxUpdate} />
              <HabitToolboxes 
                toolboxes={toolboxes || []} 
                habitId={id || ""} 
                onToolboxUpdate={handleToolboxUpdate}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Habit Details and Schedules */}
            <div className="space-y-6">
              <HabitDetailForm habit={habit} id={id} onUpdate={refetchHabit} />
              <HabitFormationTracker 
                streak={habit.streak_count || 0} 
                habitName={habit.name} 
              />
              <HabitSchedules schedules={schedules || []} />
              <HabitOverview 
                identity={habit.identity || ""} 
                context={habit.context || ""} 
                smartGoal={habit.smart_goal || ""}
                frequency={habit.frequency}
                category={habit.category}
                streakCount={habit.streak_count}
                difficulty={habit.difficulty}
              />
            </div>

            {/* Right Column - Toolboxes and Reflections */}
            <div className="space-y-6">
              <HabitToolbox habitId={id || ""} onUpdate={handleToolboxUpdate} />
              <HabitToolboxes 
                toolboxes={toolboxes || []} 
                habitId={id || ""} 
                onToolboxUpdate={handleToolboxUpdate}
              />
              <HabitReflection habitId={id || ""} />
              <PastReflections />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HabitDetail;
