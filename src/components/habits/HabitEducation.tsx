
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Users, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'} border-b border-blue-100 pb-6`}>
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 shadow-sm">
            <BookOpen className="h-7 w-7 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-semibold text-gray-800`}>
              Habit Baukasten
            </h2>
            <p className="text-base text-gray-600">
              Professionelle Methoden für nachhaltigen Erfolg
            </p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          className="text-blue-600 bg-blue-50 hover:bg-blue-100 font-medium rounded-xl px-6 py-3 w-full md:w-auto shadow-sm"
          size="lg"
        >
          <span>Alle Kategorien</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)] w-full pr-4">
        <div className="space-y-6">
          {HABIT_TOOLKITS.map((toolkit) => (
            <Card
              key={toolkit.id}
              className="group relative overflow-hidden border border-blue-100/50 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300 p-8"
            >
              <div className="space-y-6">
                <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'}`}>
                  <span className="px-5 py-2 text-sm font-medium rounded-full bg-blue-50 text-blue-600 uppercase tracking-wider shadow-sm border border-blue-100/50 w-fit">
                    {toolkit.category}
                  </span>
                  <div className={`flex ${isMobile ? 'justify-between' : ''} items-center gap-8`}>
                    <div className="flex items-center gap-2">
                      <Star className="h-6 w-6 text-amber-500" />
                      <span className="text-lg font-semibold text-gray-700">
                        {toolkit.rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="h-6 w-6" />
                      <span className="text-lg font-medium">
                        {toolkit.users.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-gray-800`}>
                    {toolkit.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {toolkit.description}
                  </p>
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md"
                  size="lg"
                >
                  Methode anwenden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

