import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EditableProfileBlock } from "@/components/profile/EditableProfileBlock";
import { BigFiveSection } from "@/components/profile/BigFiveSection";
import { CoachingSection } from "@/components/profile/CoachingSection";
import { ZRMSection } from "@/components/profile/ZRMSection";
import { LifeAreasSection } from "@/components/profile/LifeAreasSection";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: responses } = useQuery({
    queryKey: ["onboarding-responses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", user.id);

      return data || [];
    },
  });

  const { data: keystoneHabits } = useQuery({
    queryKey: ["keystone-habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("keystone_habits")
        .select("*")
        .eq("user_id", user.id);

      return data || [];
    },
  });

  const { data: lifeAreas } = useQuery({
    queryKey: ["life-areas"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", user.id)
        .eq("question_key", "life_areas");

      // Get the first response if there are multiple, or return empty array
      const firstResponse = data?.[0]?.response;
      return firstResponse ? JSON.parse(firstResponse) : [];
    },
  });

  const { data: bigFiveResults } = useQuery({
    queryKey: ["big-five-results"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("big_five_results")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return data;
    },
  });

  const { data: zrmResources } = useQuery({
    queryKey: ["zrm-resources"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("zrm_resources")
        .select("*")
        .eq("user_id", user.id);

      return data || [];
    },
  });

  const { data: attitudeGoals } = useQuery({
    queryKey: ["attitude-goals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("attitude_goals")
        .select("*")
        .eq("user_id", user.id);

      return data || [];
    },
  });

  const { data: coachingReflections } = useQuery({
    queryKey: ["coaching-reflections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("coaching_reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("reflection_date", { ascending: false })
        .limit(1);

      return data?.[0];
    },
  });

  const getResponse = (key: string) => {
    return responses?.find(r => r.question_key === key)?.response || "";
  };

  const handleRestartReflection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete existing reflection data
      const { error } = await supabase
        .from("coaching_reflections")
        .delete()
        .eq("user_id", user.id)
        .eq("reflection_date", new Date().toISOString().split('T')[0]);

      if (error) throw error;

      toast({
        title: "Reflexion zurückgesetzt",
        description: "Du kannst jetzt eine neue Reflexion starten.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Reflexion konnte nicht zurückgesetzt werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 transition-all duration-500">
      <Navigation />
      <main className="container py-8 px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
            Dein Persönlichkeitsprofil
          </h1>
          <div className="flex gap-2">
            <Button onClick={handleRestartReflection} variant="outline" className="hover:bg-blue-50 gap-2">
              <RefreshCw className="h-4 w-4" />
              Reflexion neu starten
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6">
          <EditableProfileBlock
            title="Motivation"
            content={getResponse("motivation")}
            sectionKey="motivation"
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] })}
          />

          <EditableProfileBlock
            title="Herausforderungen"
            content={getResponse("challenges")}
            sectionKey="challenges"
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] })}
          />

          <BigFiveSection results={bigFiveResults} />
          <CoachingSection reflection={coachingReflections} />
          <ZRMSection resources={zrmResources || []} goals={attitudeGoals || []} />
          <LifeAreasSection areas={lifeAreas || []} />
        </div>
      </main>
    </div>
  );
};

export default Profile;
