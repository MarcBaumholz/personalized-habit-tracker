
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Smile, BookOpen, Trash2, MinusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmotionTracker } from "../EmotionTracker";
import { EditHabitDialog } from "../EditHabitDialog";

interface HabitControlsProps {
  habit: any;
  elasticLevel: string;
  onUpdateElasticLevel: (level: string) => void;
  onShowEmotionTracker: (show: boolean) => void;
  showEmotionTracker: boolean;
  onShowHabitLoop: (show: boolean) => void;
  showHabitLoop: boolean;
  onReflect: () => void;
  needsReflection: boolean;
  lastReflection: any;
  onDelete: () => void;
}

export const HabitControls = ({
  habit,
  elasticLevel,
  onUpdateElasticLevel,
  onShowEmotionTracker,
  showEmotionTracker,
  onShowHabitLoop,
  showHabitLoop,
  onReflect,
  needsReflection,
  lastReflection,
  onDelete,
}: HabitControlsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Dialog open={showHabitLoop} onOpenChange={onShowHabitLoop}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Habit Loop
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dein Habit Loop</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div className="rounded-lg bg-purple-50 p-4">
              <h4 className="font-semibold mb-2">Cue (Auslöser)</h4>
              <p className="text-sm text-gray-600">
                {habit.cue || "Was löst diese Gewohnheit aus?"}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="font-semibold mb-2">Craving (Verlangen)</h4>
              <p className="text-sm text-gray-600">
                {habit.craving || "Welches Bedürfnis steckt dahinter?"}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="font-semibold mb-2">Routine</h4>
              <p className="text-sm text-gray-600">{habit.name}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <h4 className="font-semibold mb-2">Reward (Belohnung)</h4>
              <p className="text-sm text-gray-600">
                {habit.reward || "Wie belohnst du dich?"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onUpdateElasticLevel(elasticLevel === "easy" ? "medium" : "easy")}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <span className="text-xs text-gray-500 capitalize">{elasticLevel}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onUpdateElasticLevel(elasticLevel === "hard" ? "medium" : "hard")}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showEmotionTracker} onOpenChange={onShowEmotionTracker}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Smile className="h-4 w-4 mr-2" />
            Gefühl
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wie fühlst du dich?</DialogTitle>
          </DialogHeader>
          <EmotionTracker
            habitId={habit.id}
            onClose={() => onShowEmotionTracker(false)}
          />
        </DialogContent>
      </Dialog>

      <EditHabitDialog habit={habit} />

      <Button
        size="sm"
        variant={needsReflection ? "destructive" : "outline"}
        onClick={onReflect}
        className={lastReflection && !needsReflection ? "border-green-500 text-green-600" : ""}
      >
        Reflektieren
      </Button>

      {habit.minimal_dose && (
        <Button
          size="sm"
          variant="outline"
          className="bg-yellow-100 border-yellow-400 text-yellow-800"
        >
          <MinusCircle className="h-4 w-4 text-yellow-600 fill-yellow-100" />
        </Button>
      )}

      <Button
        size="sm"
        variant="ghost"
        onClick={onDelete}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
