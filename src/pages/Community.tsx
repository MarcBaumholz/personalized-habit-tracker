import { Navigation } from "@/components/layout/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2 } from "lucide-react";

const Community = () => {
  const posts = [
    {
      id: 1,
      user: {
        name: "Max M.",
        avatar: "/placeholder.svg",
      },
      habit: "Meditation",
      description: "30 Tage Meditation Challenge erfolgreich abgeschlossen!",
      likes: 24,
      comments: 5,
    },
    {
      id: 2,
      user: {
        name: "Sarah K.",
        avatar: "/placeholder.svg",
      },
      habit: "Deep Work",
      description: "Meine Erfahrungen mit der 4-Stunden Deep Work Routine",
      likes: 18,
      comments: 3,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Community</h1>
          <Button>Teile deine Erfolge</Button>
        </div>

        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Avatar>
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>{post.user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{post.user.name}</h3>
                  <p className="text-sm text-muted-foreground">{post.habit}</p>
                </div>
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
      </main>
    </div>
  );
};

export default Community;