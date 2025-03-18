
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImplementationIntentions } from "@/components/habits/ImplementationIntentions";
import { EmotionalAnchoring } from "@/components/toolbox/EmotionalAnchoring";
import { MinimalDoseCalculator } from "@/components/habits/MinimalDoseCalculator";
import { ArrowRightLeft, Brain, Star } from "lucide-react";

interface HabitToolboxProps {
  habitId: string;
  onUpdate?: () => void;
  activeTab?: string;
  onTabChange?: (value: string) => void;
}

export const HabitToolbox = ({ habitId, onUpdate, activeTab = "intentions", onTabChange }: HabitToolboxProps) => {
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Card className="shadow-sm border">
      <CardHeader className="bg-white pb-2">
        <CardTitle className="text-xl">Aktives Werkzeug</CardTitle>
        <CardDescription>
          Wissenschaftlich fundierte Werkzeuge zur besseren Gewohnheitsbildung
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs 
          defaultValue={activeTab} 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full rounded-none p-0 h-auto">
            <TabsTrigger value="intentions" className="py-3 rounded-none data-[state=active]:bg-blue-50">
              <div className="flex flex-col items-center gap-1">
                <ArrowRightLeft className="h-4 w-4" />
                <span className="text-xs">Wenn-Dann</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="zrm" className="py-3 rounded-none data-[state=active]:bg-purple-50">
              <div className="flex flex-col items-center gap-1">
                <Brain className="h-4 w-4" />
                <span className="text-xs">ZRM</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="minimal" className="py-3 rounded-none data-[state=active]:bg-amber-50">
              <div className="flex flex-col items-center gap-1">
                <Star className="h-4 w-4" />
                <span className="text-xs">Min. Dosis</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="intentions" className="p-0 m-0 border-none">
            <ImplementationIntentions 
              habitId={habitId}
              onSave={onUpdate}
              title="Wenn-Dann Pläne"
              description="Definiere konkrete Situationen und wie du darauf reagieren wirst."
            />
          </TabsContent>
          
          <TabsContent value="zrm" className="p-0 m-0 border-none">
            <EmotionalAnchoring habitId={habitId} onSave={onUpdate} />
          </TabsContent>
          
          <TabsContent value="minimal" className="p-0 m-0 border-none">
            <MinimalDoseCalculator habitId={habitId} onSave={onUpdate} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
