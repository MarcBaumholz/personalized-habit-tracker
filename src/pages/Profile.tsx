
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 transition-all duration-500">
      <Navigation />
      <main className="container py-8 px-4 md:px-6 lg:px-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-purple-800 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent">
            Dein Persönlichkeitsprofil
          </h1>
          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline" className="hover:bg-purple-50">
              <Pencil className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
            <Button onClick={handleRestartOnboarding} variant="outline" className="hover:bg-purple-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reflexion neustarten
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6">
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
