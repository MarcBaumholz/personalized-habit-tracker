import { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Mail, UserPlus, UserCheck } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { EditableProfileBlock } from "@/components/profile/EditableProfileBlock";
import { BigFiveSection } from "@/components/profile/BigFiveSection";
import { CoachingSection } from "@/components/profile/CoachingSection";
import { ZRMSection } from "@/components/profile/ZRMSection";
import { LifeAreasSection } from "@/components/profile/LifeAreasSection";
import { KeystoneHabitsSection } from "@/components/profile/KeystoneHabitsSection";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  
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

  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return data;
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

  const getResponse = (key: string) => {
    return responses?.find(r => r.question_key === key)?.response || "";
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Nicht mehr gefolgt" : "Du folgst jetzt diesem Profil",
      description: isFollowing ? "Du folgst diesem Profil nicht mehr." : "Du wirst über Aktualisierungen informiert.",
    });
  };

  const handleRestartOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete existing onboarding responses
      const { error: onboardingError } = await supabase
        .from("onboarding_responses")
        .delete()
        .eq("user_id", user.id);

      if (onboardingError) throw onboardingError;

      // Delete existing reflection data
      const { error: reflectionError } = await supabase
        .from("coaching_reflections")
        .delete()
        .eq("user_id", user.id);

      if (reflectionError) throw reflectionError;

      // Delete existing keystone habits
      const { error: habitError } = await supabase
        .from("keystone_habits")
        .delete()
        .eq("user_id", user.id);

      if (habitError) throw habitError;

      // Delete existing Big Five results
      const { error: bigFiveError } = await supabase
        .from("big_five_results")
        .delete()
        .eq("user_id", user.id);

      if (bigFiveError) throw bigFiveError;

      // Delete ZRM resources
      const { error: zrmError } = await supabase
        .from("zrm_resources")
        .delete()
        .eq("user_id", user.id);

      if (zrmError) throw zrmError;

      // Delete attitude goals
      const { error: goalsError } = await supabase
        .from("attitude_goals")
        .delete()
        .eq("user_id", user.id);

      if (goalsError) throw goalsError;

      toast({
        title: "Onboarding neu gestartet",
        description: "Alle deine Daten wurden zurückgesetzt. Du kannst jetzt von vorne beginnen.",
      });

      // Refresh all queries
      queryClient.invalidateQueries();

      // Redirect to onboarding
      navigate("/onboarding");
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Onboarding konnte nicht neu gestartet werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 transition-all duration-500">
      <Navigation />
      <main className="container py-8 px-4 md:px-6 lg:px-8 animate-fade-in">
        <ProfileHeader 
          profile={userProfile} 
          isFollowing={isFollowing} 
          onFollowToggle={handleFollowToggle} 
          onRestartOnboarding={handleRestartOnboarding}
        />

        <div className="mt-8">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="about">Über mich</TabsTrigger>
              <TabsTrigger value="personality">Persönlichkeit</TabsTrigger>
              <TabsTrigger value="habits">Gewohnheiten</TabsTrigger>
              <TabsTrigger value="areas">Lebensbereiche</TabsTrigger>
            </TabsList>
            
            <TabsContent value="about" className="space-y-6 animate-fade-in">
              <Card className="p-6 bg-white rounded-2xl shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">Über mich</h2>
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
                  <EditableProfileBlock
                    title="Neugier & Veränderung"
                    content={getResponse("curiosities")}
                    sectionKey="curiosities"
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] })}
                  />
                </div>
              </Card>
              
              <Card className="p-6 bg-white rounded-2xl shadow-sm border border-blue-100">
                <h2 className="text-xl font-semibold text-blue-800 mb-4">Werte & Gewohnheiten</h2>
                <div className="grid gap-6">
                  <EditableProfileBlock
                    title="Werte & Normen"
                    content={getResponse("values")}
                    sectionKey="values"
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] })}
                  />
                  <EditableProfileBlock
                    title="Aktuelle Gewohnheiten"
                    content={getResponse("current_habits")}
                    sectionKey="current_habits"
                    onUpdate={() => queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] })}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="personality" className="space-y-6 animate-fade-in">
              <BigFiveSection results={bigFiveResults} />
              <CoachingSection reflection={coachingReflections} />
              <ZRMSection resources={zrmResources || []} goals={attitudeGoals || []} />
            </TabsContent>
            
            <TabsContent value="habits" className="animate-fade-in">
              <KeystoneHabitsSection habits={keystoneHabits || []} />
            </TabsContent>
            
            <TabsContent value="areas" className="animate-fade-in">
              <LifeAreasSection areas={lifeAreas || []} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;
