import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Star, Users, Coffee } from "lucide-react";

const Profile = () => {
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
        <h1 className="text-2xl font-bold mb-6">Dein Persönlichkeitsprofil</h1>
        
        <div className="grid gap-6">
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

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Persönliche Stärken</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium mb-2">Fokussierte Arbeit</h3>
                <p className="text-sm text-muted-foreground">
                  Deine hohe Gewissenhaftigkeit unterstützt dich bei konzentrierter Arbeit.
                </p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <h3 className="font-medium mb-2">Soziale Interaktion</h3>
                <p className="text-sm text-muted-foreground">
                  Deine Verträglichkeit hilft dir bei der Zusammenarbeit mit anderen.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">ZRM-Entwicklungsbereiche</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Aktuelles Haltungsziel</h3>
                <p className="text-sm text-muted-foreground">
                  "Ich bin wie ein ruhiger Berg, der gelassen neue Herausforderungen meistert"
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Ressourcenpool</h3>
                <div className="flex gap-2 flex-wrap">
                  {["Meditation", "Sport", "Natur", "Musik"].map((resource) => (
                    <span key={resource} className="px-2 py-1 bg-secondary rounded text-sm">
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