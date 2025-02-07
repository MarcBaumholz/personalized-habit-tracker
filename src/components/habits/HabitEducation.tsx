
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const HABIT_TOOLKITS = [
  {
    id: "smart",
    title: "SMART Goals",
    description: "Spezifisch, Messbar, Attraktiv, Realistisch, Terminiert",
  },
  {
    id: "stacking",
    title: "Habit Stacking",
    description: "Neue Gewohnheiten an bestehende Routinen knüpfen",
  },
  {
    id: "environment",
    title: "Umgebungsdesign",
    description: "Optimiere deine Umgebung für erfolgreiche Gewohnheiten",
  },
];

export const HabitEducation = () => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900/90 to-zinc-800/90 backdrop-blur-sm border-zinc-800 shadow-2xl p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />
      
      <div className="relative space-y-6">
        <div className="flex items-center gap-3 border-b border-zinc-700/50 pb-4">
          <BookOpen className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Habit Baukasten
          </h2>
        </div>
        
        <p className="text-zinc-400">
          Wähle aus verschiedenen bewährten Methoden, um deine Gewohnheiten zu optimieren.
        </p>

        <ScrollArea className="h-[400px] pr-4">
          <div className="grid gap-4">
            {HABIT_TOOLKITS.map((toolkit) => (
              <div
                key={toolkit.id}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-zinc-800/50 p-6 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-3">
                  <h3 className="text-lg font-semibold text-zinc-200">
                    {toolkit.title}
                  </h3>
                  <p className="text-sm text-zinc-400 line-clamp-3">
                    {toolkit.description}
                  </p>
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white border-0"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Anwenden
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};
