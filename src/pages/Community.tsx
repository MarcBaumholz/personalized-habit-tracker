
import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityChallenges } from "@/components/community/CommunityChallenges";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();
  
  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session!.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Dummy user posts with more content for a realistic feel
  const posts = [
    {
      id: 1,
      user: {
        name: profile?.full_name || profile?.username || "Max M.",
        avatar: profile?.avatar_url || "/placeholder.svg",
      },
      habit: "Meditation",
      description: "30 Tage Meditation Challenge erfolgreich abgeschlossen! Ich hätte nie gedacht, dass ich es schaffen würde, jeden Tag zu meditieren, aber die Ergebnisse sind erstaunlich. Mehr Fokus, weniger Stress und besserer Schlaf!",
      likes: 24,
      comments: 5,
      timeAgo: "vor 2 Stunden",
    },
    {
      id: 2,
      user: {
        name: "Sarah K.",
        avatar: "/placeholder.svg",
      },
      habit: "Deep Work",
      description: "Meine Erfahrungen mit der 4-Stunden Deep Work Routine haben meine Produktivität völlig verändert. Durch gezieltes Blockieren von Ablenkungen und volle Konzentration auf eine Aufgabe konnte ich Projekte abschließen, die ich monatelang aufgeschoben hatte.",
      likes: 18,
      comments: 3,
      timeAgo: "vor 5 Stunden",
    },
    {
      id: 3,
      user: {
        name: "Thomas W.",
        avatar: "/placeholder.svg",
      },
      habit: "Lesegewohnheiten",
      description: "1000 Seiten in 2 Monaten - Ein Erfahrungsbericht. Mit einer systematischen Herangehensweise und täglichen 20-Minuten-Slots habe ich es geschafft, mein Leseziel zu erreichen. Mein Tipp: Lese verschiedene Genres parallel und wechsle je nach Stimmung.",
      likes: 31,
      comments: 7,
      timeAgo: "vor 1 Tag",
    },
    {
      id: 4,
      user: {
        name: "Julia M.",
        avatar: "/placeholder.svg",
      },
      habit: "Fitness",
      description: "Mein Weg zu 100km Laufen im Monat - Tipps für Anfänger: 1) Langsam anfangen, 2) Konsistenz ist wichtiger als Geschwindigkeit, 3) Gute Schuhe sind entscheidend, 4) Einen Laufbuddy finden, 5) Kleine Meilensteine feiern. Wer möchte sich der Herausforderung anschließen?",
      likes: 42,
      comments: 12,
      timeAgo: "vor 2 Tagen",
    },
    {
      id: 5,
      user: {
        name: "Michael R.",
        avatar: "/placeholder.svg",
      },
      habit: "Journaling",
      description: "Nach 60 Tagen täglichem Journaling kann ich sagen: Es ist eine Superkraft für mentale Klarheit! Ich notiere jeden Morgen drei Dinge, für die ich dankbar bin, und plane drei wichtige Aufgaben für den Tag. Abends reflektiere ich über Erfolge und Lernmomente.",
      likes: 29,
      comments: 8,
      timeAgo: "vor 3 Tagen",
    },
    {
      id: 6,
      user: {
        name: "Laura B.",
        avatar: "/placeholder.svg",
      },
      habit: "Ernährung",
      description: "Meal Prep hat mein Leben verändert! Ich koche jetzt zweimal pro Woche vor und spare dadurch nicht nur Zeit und Geld, sondern esse auch viel gesünder. Wer Rezeptideen braucht, kann mich gerne anschreiben.",
      likes: 36,
      comments: 15,
      timeAgo: "vor 4 Tagen",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <Tabs defaultValue="challenges" className="w-full mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="posts">Beiträge</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges">
            <CommunityChallenges />
          </TabsContent>

          <TabsContent value="posts">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Community-Beiträge</h1>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Neuer Beitrag
              </Button>
            </div>

            <div className="grid gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="p-6">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{post.user.name}</h3>
                        <p className="text-sm text-muted-foreground">{post.habit}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{post.timeAgo}</span>
                  </div>
                  
                  <p className="mb-4">{post.description}</p>
                  
                  <div className="flex gap-4">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Teilen
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Community;
