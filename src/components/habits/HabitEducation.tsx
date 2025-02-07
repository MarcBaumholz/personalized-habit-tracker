
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
    gradient: "from-blue-500/20 to-indigo-500/20",
    hover: "group-hover:from-blue-500/30 group-hover:to-indigo-500/30",
  },
  {
    id: "stacking",
    title: "Habit Stacking",
    description: "Neue Gewohnheiten an bestehende Routinen knüpfen",
    category: "FORTGESCHRITTEN",
    rating: 4.9,
    users: 1892,
    gradient: "from-purple-500/20 to-pink-500/20",
    hover: "group-hover:from-purple-500/30 group-hover:to-pink-500/30",
  },
  {
    id: "environment",
    title: "Umgebungsdesign",
    description: "Optimiere deine Umgebung für erfolgreiche Gewohnheiten",
    category: "ADVANCED",
    rating: 4.5,
    users: 1567,
    gradient: "from-emerald-500/20 to-teal-500/20",
    hover: "group-hover:from-emerald-500/30 group-hover:to-teal-500/30",
  },
];

export const HabitEducation = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Habit Baukasten
          </h2>
        </div>
        <Button variant="outline" className="text-zinc-400 border-zinc-800">
          Alle Kategorien
        </Button>
      </div>

      <ScrollArea className="h-[480px] pr-4">
        <div className="grid gap-4">
          {HABIT_TOOLKITS.map((toolkit) => (
            <Card
              key={toolkit.id}
              className="group relative overflow-hidden border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${toolkit.gradient} transition-colors duration-300 ${toolkit.hover}`} />
              
              <div className="relative p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-zinc-800/50 text-zinc-400">
                    {toolkit.category}
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-zinc-300">
                        {toolkit.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {toolkit.users.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {toolkit.title}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {toolkit.description}
                  </p>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white border-0"
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
