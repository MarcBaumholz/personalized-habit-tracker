
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Star, Users, Coffee, RefreshCw, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

  const getResponse = (key: string) => {
    return responses?.find(r => r.question_key === key)?.response || "";
  };

  const handleRestartOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await supabase
        .from("onboarding_responses")
        .delete()
        .eq("user_id", user.id);

      toast({
        title: "Onboarding zurückgesetzt",
        description: "Du kannst den Prozess jetzt neu starten.",
      });

      navigate("/onboarding");
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Zurücksetzen ist ein Fehler aufgetreten.",
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 transition-all duration-500">
      <Navigation />
      <main className="container py-8 px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-purple-800 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
            Dein Persönlichkeitsprofil
          </h1>
          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline" className="hover:bg-purple-50">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button onClick={handleRestartOnboarding} variant="outline" className="hover:bg-purple-50">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6">
          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-purple-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Deine ausgewählten Lebensbereiche</h2>
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
                    className={`p-4 rounded-lg border-2 ${area.color}`}
                  >
                    <span className="font-medium">{area.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-purple-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Big Five Persönlichkeitstest</h2>
            {bigFiveResults ? (
              <div className="space-y-4">
                {Object.entries(bigFiveResults)
                  .filter(([key]) => ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"].includes(key))
                  .map(([trait, score]) => (
                    <div key={trait} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-purple-700">{getPersonalityTraitLabel(trait)}</span>
                        <span className="text-sm text-purple-600">{Math.round(score as number)}%</span>
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
                      className="text-purple-600 hover:text-purple-700 text-sm underline"
                    >
                      Detaillierte Ergebnisse anzeigen (PDF)
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-purple-600">Noch keine Testergebnisse vorhanden.</p>
            )}
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-purple-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Deine Keystone Habits</h2>
            <div className="space-y-4">
              {keystoneHabits?.map((habit, index) => (
                <div key={index} className="p-4 border rounded-lg bg-purple-50/50">
                  <h3 className="font-medium mb-2 text-purple-700">{habit.habit_name}</h3>
                  <p className="text-purple-600 mb-2">{habit.description}</p>
                  <p className="text-sm text-purple-500">Lebensbereich: {habit.life_area}</p>
                  {habit.guideline && (
                    <p className="text-sm text-purple-500 mt-2">Leitfaden: {habit.guideline}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-purple-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">Deine Onboarding Antworten</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <h3 className="font-medium mb-2 text-purple-700">Motivation</h3>
                <p className="text-purple-600">{getResponse("motivation")}</p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <h3 className="font-medium mb-2 text-purple-700">Herausforderungen</h3>
                <p className="text-purple-600">{getResponse("challenges")}</p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <h3 className="font-medium mb-2 text-purple-700">Gewünschte Überzeugungen</h3>
                <p className="text-purple-600">{getResponse("beliefs")}</p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <h3 className="font-medium mb-2 text-purple-700">Schlüsselgewohnheiten</h3>
                <p className="text-purple-600">{getResponse("keystone_habits")}</p>
              </div>
              <div className="p-4 border rounded-lg bg-purple-50/50">
                <h3 className="font-medium mb-2 text-purple-700">Umsetzungsbedenken</h3>
                <p className="text-purple-600">{getResponse("implementation")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white rounded-2xl shadow-lg border border-purple-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">ZRM-Entwicklungsbereiche</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-purple-700">Aktuelles Haltungsziel</h3>
                <p className="text-purple-600 italic">
                  "Ich bin wie ein ruhiger Berg, der gelassen neue Herausforderungen meistert"
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-purple-700">Ressourcenpool</h3>
                <div className="flex gap-2 flex-wrap">
                  {["Meditation", "Sport", "Natur", "Musik"].map((resource) => (
                    <span
                      key={resource}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {resource}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
