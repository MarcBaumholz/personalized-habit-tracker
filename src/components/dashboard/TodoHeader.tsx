
import { Clock, Sparkles } from "lucide-react";

interface TodoHeaderProps {
  timeUntilMidnight: string;
}

export const TodoHeader = ({ timeUntilMidnight }: TodoHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-yellow-400" />
        <h2 className="text-xl font-bold">Todos für heute</h2>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Noch {timeUntilMidnight} bis Mitternacht</span>
      </div>
    </div>
  );
};
