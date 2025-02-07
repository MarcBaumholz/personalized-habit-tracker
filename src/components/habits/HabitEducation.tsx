
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const HABIT_TOOLKITS = [
  {
    id: "smart",
    title: "SMART Goals",
    description: "Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert",
    category: "GRUNDLAGEN",
    rating: 4.7,
    users: 2341,
    gradient: "from-zinc-500/10 to-zinc-700/10",
    hover: "group-hover:from-zinc-500/20 group-hover:to-zinc-700/20",
  },
  {
    id: "stacking",
    title: "Habit Stacking",
    description: "Neue Gewohnheiten an bestehende Routinen knüpfen",
    category: "FORTGESCHRITTEN",
    rating: 4.9,
    users: 1892,
    gradient: "from-zinc-600/10 to-zinc-800/10",
    hover: "group-hover:from-zinc-600/20 group-hover:to-zinc-800/20",
  },
  {
    id: "environment",
    title: "Umgebungsdesign",
    description: "Optimiere deine Umgebung für erfolgreiche Gewohnheiten",
    category: "ADVANCED",
    rating: 4.5,
    users: 1567,
    gradient: "from-zinc-700/10 to-zinc-900/10",
    hover: "group-hover:from-zinc-700/20 group-hover:to-zinc-900/20",
  },
];

export const HabitEducation = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-zinc-400" />
          <h2 className="text-2xl font-bold text-zinc-800">
            Habit Baukasten
          </h2>
        </div>
        <Button 
          variant="outline" 
          className="text-zinc-600 border-zinc-200 hover:bg-zinc-50"
        >
          Alle Kategorien
        </Button>
      </div>

      <ScrollArea className="h-[480px] pr-4">
        <div className="grid gap-4">
          {HABIT_TOOLKITS.map((toolkit) => (
            <Card
              key={toolkit.id}
              className="group relative overflow-hidden border-zinc-200/50 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${toolkit.gradient} transition-colors duration-300 ${toolkit.hover}`} 
              />
              
              <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-100/80 text-zinc-600">
                    {toolkit.category}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-zinc-700">
                        {toolkit.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-500">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {toolkit.users.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-zinc-800">
                    {toolkit.title}
                  </h3>
                  <p className="text-sm text-zinc-600 line-clamp-2">
                    {toolkit.description}
                  </p>
                </div>

                <Button 
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
                  size="sm"
                >
                  Methode anwenden
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
