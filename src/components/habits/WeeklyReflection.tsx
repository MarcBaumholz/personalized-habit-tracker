import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export const WeeklyReflection = () => {
  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold text-primary">Wöchentliche Reflexion</h2>
      <p className="text-text-secondary">
        Nimm dir Zeit, um über deine Fortschritte nachzudenken und deine
        Gewohnheiten anzupassen.
      </p>
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5 text-primary" />
        <span className="text-sm">Nächste Reflexion: Sonntag</span>
      </div>
      <Button className="w-full">Reflexion starten</Button>
    </Card>
  );
};