
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
    gradient: "from-gray-100 to-gray-50",
    hover: "group-hover:from-gray-200 group-hover:to-gray-100",
  },
  {
    id: "stacking",
    title: "Habit Stacking",
    description: "Neue Gewohnheiten an bestehende Routinen knüpfen",
    category: "FORTGESCHRITTEN",
    rating: 4.9,
    users: 1892,
    gradient: "from-gray-100 to-gray-50",
    hover: "group-hover:from-gray-200 group-hover:to-gray-100",
  },
  {
    id: "environment",
    title: "Umgebungsdesign",
    description: "Optimiere deine Umgebung für erfolgreiche Gewohnheiten",
    category: "ADVANCED",
    rating: 4.5,
    users: 1567,
    gradient: "from-gray-100 to-gray-50",
    hover: "group-hover:from-gray-200 group-hover:to-gray-100",
  },
];

export const HabitEducation = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100">
            <BookOpen className="h-6 w-6 text-gray-700" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-900">
              Habit Baukasten
            </h2>
            <p className="text-sm text-gray-500">
              Professionelle Methoden für nachhaltigen Erfolg
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="text-gray-700 border-gray-200 hover:bg-gray-50 font-medium"
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
              className="group relative overflow-hidden border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${toolkit.gradient} transition-colors duration-300 ${toolkit.hover}`} 
              />
              
              <div className="relative p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700 uppercase tracking-wider">
                    {toolkit.category}
                  </span>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-semibold text-gray-900">
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
                  <h3 className="text-xl font-semibold text-gray-900">
                    {toolkit.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {toolkit.description}
                  </p>
                </div>

                <Button 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium"
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
