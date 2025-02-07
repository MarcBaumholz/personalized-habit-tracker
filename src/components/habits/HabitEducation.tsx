
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Users, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const HABIT_TOOLKITS = [
  {
    id: "smart",
    title: "SMART Goals",
    description: "Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert",
    category: "GRUNDLAGEN",
    rating: 4.7,
    users: 2341,
  },
  {
    id: "stacking",
    title: "Habit Stacking",
    description: "Neue Gewohnheiten an bestehende Routinen knüpfen",
    category: "FORTGESCHRITTEN",
    rating: 4.9,
    users: 1892,
  },
  {
    id: "environment",
    title: "Umgebungsdesign",
    description: "Optimiere deine Umgebung für erfolgreiche Gewohnheiten",
    category: "ADVANCED",
    rating: 4.5,
    users: 1567,
  },
];

export const HabitEducation = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-800/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gray-900/5 backdrop-blur-sm border border-gray-200/10">
            <BookOpen className="h-6 w-6 text-gray-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-800">
              Habit Baukasten
            </h2>
            <p className="text-sm text-gray-500">
              Professionelle Methoden für nachhaltigen Erfolg
            </p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          className="text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-xl"
        >
          <span>Alle Kategorien</span>
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[580px] pr-4">
        <div className="grid gap-6">
          {HABIT_TOOLKITS.map((toolkit) => (
            <Card
              key={toolkit.id}
              className="group relative overflow-hidden border-0 bg-gradient-to-br from-gray-50 to-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <div className="relative p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-gray-900/5 text-gray-700 uppercase tracking-wider backdrop-blur-sm border border-gray-200/10">
                    {toolkit.category}
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        {toolkit.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="h-5 w-5" />
                      <span className="text-sm font-medium">
                        {toolkit.users.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {toolkit.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {toolkit.description}
                  </p>
                </div>

                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl"
                  size="lg"
                >
                  Methode anwenden
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
