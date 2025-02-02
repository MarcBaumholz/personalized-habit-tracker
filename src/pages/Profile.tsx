import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Star, Users, Coffee, RefreshCw } from "lucide-react";
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

  const personalityTraits = [
    { trait: "Offenheit", score: 75, icon: Brain },
    { trait: "Gewissenhaftigkeit", score: 82, icon: Star },
    { trait: "Extraversion", score: 60, icon: Users },
    { trait: "Verträglichkeit", score: 85, icon: Heart },
    { trait: "Neurotizismus", score: 45, icon: Coffee },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dein Persönlichkeitsprofil</h1>
          <Button onClick={handleRestartOnboarding} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reflexion neustarten
          </Button>
        </div>
        
        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Deine Antworten aus dem Onboarding</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Motivation</h3>
                <p className="text-muted-foreground">{getResponse("motivation")}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Herausforderungen</h3>
                <p className="text-muted-foreground">{getResponse("challenges")}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Gewünschte Überzeugungen</h3>
                <p className="text-muted-foreground">{getResponse("beliefs")}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Big Five Persönlichkeitsmerkmale</h2>
            <div className="space-y-4">
              {personalityTraits.map(({ trait, score, icon: Icon }) => (
                <div key={trait} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{trait}</span>
                    <span className="ml-auto">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;