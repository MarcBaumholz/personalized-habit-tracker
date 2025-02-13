import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Star, Users, Coffee, RefreshCw, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AddZRMResourceDialog } from "@/components/zrm/AddZRMResourceDialog";
import { AddAttitudeGoalDialog } from "@/components/zrm/AddAttitudeGoalDialog";
import { AddReflectionDialog } from "@/components/coaching/AddReflectionDialog";
import { EditDialog } from "@/components/profile/EditDialog";
import { EditableProfileBlock } from "@/components/profile/EditableProfileBlock";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  const handleEdit = () => {
    navigate("/onboarding");
  };

  const getPersonalityTraitLabel = (trait: string) => {
    const labels: Record<string, string> = {
      openness: "Offenheit für Erfahrungen",
      conscientiousness: "Gewissenhaftigkeit",
      extraversion: "Extraversion",
      agreeableness: "Verträglichkeit",
      neuroticism: "Neurotizismus",
    };
    return labels[trait] || trait;
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
            <Button onClick={handleEdit} variant="outline" className="hover:bg-blue-50">
              <Pencil className="h-4 w-4" />
            </Button>
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

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">Big Five Persönlichkeitstest</h2>
              <EditDialog title="Persönlichkeitstest wiederholen">
                <PersonalityQuiz onComplete={() => {
                  queryClient.invalidateQueries({ queryKey: ["big-five-results"] });
                }} />
              </EditDialog>
            </div>
            <div className="space-y-4">
              {bigFiveResults ? (
                <div className="space-y-4">
                  {Object.entries(bigFiveResults)
                    .filter(([key]) => ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"].includes(key))
                    .map(([trait, score]) => (
                      <div key={trait} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-700">{getPersonalityTraitLabel(trait)}</span>
                          <span className="text-sm text-blue-600">{Math.round(score as number)}%</span>
                        </div>
                        <Progress value={score as number} className="h-2" />
                      </div>
                    ))}
                  {bigFiveResults.pdf_url && (
                    <div className="mt-4">
                      <a
                        href={bigFiveResults.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm underline"
                      >
                        Detaillierte Ergebnisse anzeigen (PDF)
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-blue-600">Noch keine Testergebnisse vorhanden.</p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">Coaching Reflexion</h2>
              <div className="flex gap-2">
                <EditDialog title="Reflexion bearbeiten">
                  <AddReflectionDialog />
                </EditDialog>
              </div>
            </div>
            <div className="space-y-4">
              {coachingReflections ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-blue-600">Energielevel</p>
                      <Progress value={coachingReflections.energy_level * 10} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-blue-600">Stimmung</p>
                      <Progress value={coachingReflections.mood_rating * 10} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-700">Herausforderungen & Lösungen</h3>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{coachingReflections.challenges}</p>
                      <p className="text-sm text-blue-600 mt-2">{coachingReflections.solutions}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-700">Werte & Stärken</h3>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">{coachingReflections.values_alignment}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {coachingReflections.strengths_used?.map((strength: string) => (
                          <span key={strength} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-blue-600">Noch keine Reflexionen vorhanden.</p>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">Zürcher Ressourcen Model (ZRM)</h2>
              <div className="flex gap-2">
                <EditDialog title="ZRM Ressourcen bearbeiten">
                  <AddZRMResourceDialog />
                </EditDialog>
                <EditDialog title="Haltungsziele bearbeiten">
                  <AddAttitudeGoalDialog />
                </EditDialog>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium text-blue-700">Ressourcenpool</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {zrmResources?.map((resource: any) => (
                    <div key={resource.id} className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">{resource.resource_type}</p>
                      <p className="text-sm text-blue-600">{resource.resource_content}</p>
                      <p className="text-xs text-blue-500 mt-1">
                        Emotionale Stärke: {resource.somatic_marker_strength}/5
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-blue-700">Haltungsziele</h3>
                  <AddAttitudeGoalDialog />
                </div>
                <div className="space-y-3">
                  {attitudeGoals?.map((goal: any) => (
                    <div key={goal.id} className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium">{goal.goal_statement}</p>
                      {goal.if_then_plan && (
                        <p className="text-sm text-blue-600 mt-2">
                          Wenn-Dann-Plan: {goal.if_then_plan}
                        </p>
                      )}
                      {goal.embodiment_practice && (
                        <p className="text-sm text-blue-600 mt-1">
                          Embodiment: {goal.embodiment_practice}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-800">Deine ausgewählten Lebensbereiche</h2>
              <div className="flex gap-2">
                <EditDialog title="Lebensbereiche bearbeiten">
                  <LifeAreasSelection onComplete={() => {
                    queryClient.invalidateQueries({ queryKey: ["life-areas"] });
                  }} />
                </EditDialog>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lifeAreas?.map((areaId: string) => {
                  const area = {
                    health: { name: "Gesundheit", color: "bg-red-100 border-red-200 text-red-700" },
                    relationships: { name: "Beziehungen", color: "bg-pink-100 border-pink-200 text-pink-700" },
                    career: { name: "Karriere", color: "bg-blue-100 border-blue-200 text-blue-700" },
                    finance: { name: "Finanzen", color: "bg-green-100 border-green-200 text-green-700" },
                    personal: { name: "Persönlichkeit", color: "bg-purple-100 border-purple-200 text-purple-700" },
                    leisure: { name: "Freizeit", color: "bg-yellow-100 border-yellow-200 text-yellow-700" },
                    spiritual: { name: "Spiritualität", color: "bg-indigo-100 border-indigo-200 text-indigo-700" },
                    environment: { name: "Umwelt", color: "bg-teal-100 border-teal-200 text-teal-700" },
                  }[areaId];

                  return area ? (
                    <div
                      key={areaId}
                      className={`p-4 rounded-lg border-2 ${area.color} text-lg`}
                    >
                      <span className="font-medium">{area.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;

const EditableProfileBlock = ({ title, content, sectionKey, onUpdate }) => {
  return (
    <Card className="p-6 bg-white rounded-2xl shadow-lg border border-blue-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
      <h2 className="text-xl font-semibold mb-4 text-blue-800">{title}</h2>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg bg-blue-50/50">
          <p className="text-blue-600">{content}</p>
        </div>
      </div>
    </Card>
  );
};

const EditDialog = ({ title, children }) => {
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
        onClick={() => {
          // Handle dialog open
        }}
      >
        <Pencil className="h-4 w-4" />
        {title}
      </button>
      <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-4">
        {children}
      </div>
    </div>
  );
};

const LifeAreasSelection = ({ onComplete }) => {
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
        onClick={() => {
          // Handle dialog open
        }}
      >
        <Pencil className="h-4 w-4" />
        Lebensbereiche bearbeiten
      </button>
      <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Gesundheit</h3>
            <input type="checkbox" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Beziehungen</h3>
            <input type="checkbox" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Karriere</h3>
            <input type="checkbox" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Finanzen</h3>
            <input type="checkbox" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Persönlichkeit</h3>
            <input type="checkbox" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Freizeit</h3>
            <input type="checkbox" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Spiritualität</h3>
            <input type="checkbox" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Umwelt</h3>
            <input type="checkbox" />
          </div>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
          onClick={() => {
            onComplete();
          }}
        >
          Speichern
        </button>
      </div>
    </div>
  );
};

const PersonalityQuiz = ({ onComplete }) => {
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
        onClick={() => {
          // Handle dialog open
        }}
      >
        <Pencil className="h-4 w-4" />
        Persönlichkeitstest wiederholen
      </button>
      <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Offenheit für Erfahrungen</h3>
            <input type="range" min="0" max="100" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Gewissenhaftigkeit</h3>
            <input type="range" min="0" max="100" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Extraversion</h3>
            <input type="range" min="0" max="100" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Verträglichkeit</h3>
            <input type="range" min="0" max="100" />
          </div>
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-blue-700">Neurotizismus</h3>
            <input type="range" min="0" max="100" />
          </div>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
          onClick={() => {
            onComplete();
          }}
        >
          Speichern
        </button>
      </div>
    </div>
  );
};
