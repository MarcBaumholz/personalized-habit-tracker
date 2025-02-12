
import { Card } from "@/components/ui/card";
import { ArrowRight, Brain, Heart, Star, Target } from "lucide-react";

interface HabitLoopProps {
  toolkit: {
    cue: string;
    craving: string;
    routine: string;
    reward: string;
  };
}

export const HabitLoop = ({ toolkit }: HabitLoopProps) => {
  return (
    <div className="mt-8 space-y-4">
      <h4 className="text-lg font-medium text-gray-900">Habit Loop:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Cue</span>
          </div>
          <p className="text-gray-600">{toolkit.cue}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-900">Craving</span>
          </div>
          <p className="text-gray-600">{toolkit.craving}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">Routine</span>
          </div>
          <p className="text-gray-600">{toolkit.routine}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-yellow-50 to-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-900">Reward</span>
          </div>
          <p className="text-gray-600">{toolkit.reward}</p>
        </Card>
      </div>
    </div>
  );
};
