
import { useState, useEffect } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { MinusCircle } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileSections, setProfileSections] = useState<Record<string, string>>({});
  
  // Query for onboarding responses
  const { data: responses, isLoading: loadingResponses } = useQuery({
    queryKey: ["onboarding-responses"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching onboarding responses:", error);
        return [];
      }

      return data || [];
    },
  });

  // Query for profile sections
  const { data: sections, isLoading: loadingSections } = useQuery({
    queryKey: ["profile-sections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profile_sections")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching profile sections:", error);
        return [];
      }

      return data || [];
    },
  });

  // Combine onboarding responses and profile sections
  useEffect(() => {
    const combinedSections: Record<string, string> = {};
    
    // First add onboarding responses
    if (responses) {
      responses.forEach(item => {
        combinedSections[item.question_key] = item.response;
      });
    }
    
    // Then override with profile sections if they exist
    if (sections) {
      sections.forEach(item => {
        if (item.content && item.content.text) {
          combinedSections[item.section_key] = item.content.text;
        }
      });
    }
    
    setProfileSections(combinedSections);
  }, [responses, sections]);

  // Get user profile
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }

      return data;
    },
  });

  // Get keystone habits
  const { data: keystoneHabits } = useQuery({
    queryKey: ["keystone-habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("keystone_habits")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching keystone habits:", error);
        return [];
      }

      return data || [];
    },
  });

  // Get active habits
  const { data: activeHabits } = useQuery({
    queryKey: ["active-habits"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .eq("paused", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching active habits:", error);
        return [];
      }

      return data || [];
    },
  });

  // Get life areas
  const { data: lifeAreas } = useQuery({
    queryKey: ["life-areas"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("onboarding_responses")
        .select("*")
        .eq("user_id", user.id)
        .eq("question_key", "life_areas");

      if (error) {
        console.error("Error fetching life areas:", error);
        return [];
      }

      const firstResponse = data?.[0]?.response;
      return firstResponse ? JSON.parse(firstResponse) : [];
    },
  });

  // Get Big Five results
  const { data: bigFiveResults } = useQuery({
    queryKey: ["big-five-results"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("big_five_results")
        .select("*")
        .eq("user_id", user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching Big Five results:", error);
        return null;
      }

      return data;
    },
  });

  // Get coaching reflections
  const { data: coachingReflections } = useQuery({
    queryKey: ["coaching-reflections"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("coaching_reflections")
        .select("*")
        .eq("user_id", user.id)
        .order("reflection_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching coaching reflections:", error);
        return null;
      }

      return data || null;
    },
  });

  // Get ZRM resources
  const { data: zrmResources } = useQuery({
    queryKey: ["zrm-resources"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("zrm_resources")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching ZRM resources:", error);
        return [];
      }

      return data || [];
    },
  });

  // Get attitude goals
  const { data: attitudeGoals } = useQuery({
    queryKey: ["attitude-goals"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("attitude_goals")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching attitude goals:", error);
        return [];
      }

      return data || [];
    },
  });

  const getResponse = (key: string) => {
    return profileSections[key] || "";
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

      // Delete profile sections
      const { error: sectionsError } = await supabase
        .from("profile_sections")
        .delete()
        .eq("user_id", user.id);

      if (sectionsError) throw sectionsError;

      toast({
        title: "Onboarding neu gestartet",
        description: "Alle deine Daten wurden zurückgesetzt. Du kannst jetzt von vorne beginnen.",
      });

      // Refresh all queries
      queryClient.invalidateQueries();

      // Redirect to onboarding
      navigate("/onboarding");
    } catch (error) {
      console.error("Error restarting onboarding:", error);
      toast({
        title: "Fehler",
        description: "Das Onboarding konnte nicht neu gestartet werden.",
        variant: "destructive",
      });
    }
  };

  const navigateToHabitDetail = (habitId: string) => {
    navigate(`/habits/${habitId}`);
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
                    onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] });
                      queryClient.invalidateQueries({ queryKey: ["profile-sections"] });
                    }}
                  />
                  <EditableProfileBlock
                    title="Herausforderungen"
                    content={getResponse("challenges")}
                    sectionKey="challenges"
                    onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] });
                      queryClient.invalidateQueries({ queryKey: ["profile-sections"] });
                    }}
                  />
                  <EditableProfileBlock
                    title="Neugier & Veränderung"
                    content={getResponse("curiosities")}
                    sectionKey="curiosities"
                    onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] });
                      queryClient.invalidateQueries({ queryKey: ["profile-sections"] });
                    }}
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
                    onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] });
                      queryClient.invalidateQueries({ queryKey: ["profile-sections"] });
                    }}
                  />
                  <EditableProfileBlock
                    title="Aktuelle Gewohnheiten"
                    content={getResponse("current_habits")}
                    sectionKey="current_habits"
                    onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: ["onboarding-responses"] });
                      queryClient.invalidateQueries({ queryKey: ["profile-sections"] });
                    }}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="personality" className="space-y-6 animate-fade-in">
              <BigFiveSection results={bigFiveResults} />
              <CoachingSection reflection={coachingReflections} />
              <ZRMSection resources={zrmResources || []} goals={attitudeGoals || []} />
            </TabsContent>
            
            <TabsContent value="habits" className="space-y-6 animate-fade-in">
              <KeystoneHabitsSection habits={keystoneHabits || []} />
              
              <Card className="p-6 bg-white rounded-2xl shadow-sm border border-blue-100">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl font-semibold text-blue-800">Aktive Gewohnheiten</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {activeHabits && activeHabits.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeHabits.map((habit: any) => (
                        <div 
                          key={habit.id} 
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigateToHabitDetail(habit.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-blue-800">{habit.name}</h3>
                            <div className="flex items-center space-x-1">
                              {habit.streak_count > 0 && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  {habit.streak_count} Tage
                                </span>
                              )}
                              {habit.minimal_dose && (
                                <span className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-1 rounded-full">
                                  <MinusCircle className="h-4 w-4 text-yellow-600 fill-yellow-100" />
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {habit.why_description || habit.why || "Keine Beschreibung"}
                          </p>
                          <div className="mt-2 text-xs text-gray-500">
                            Bereich: {habit.life_area || "Allgemein"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Keine aktiven Gewohnheiten gefunden.
                    </div>
                  )}
                </CardContent>
              </Card>
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
