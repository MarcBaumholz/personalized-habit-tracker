
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

interface HistoryTabProps {
  habit: any;
  questions: string[];
  onClose: () => void;
}

export const HistoryTab = ({ habit, questions, onClose }: HistoryTabProps) => {
  const formatSrhiResponse = (responses: string) => {
    try {
      const parsed = JSON.parse(responses || "{}");
      return parsed;
    } catch (error) {
      console.error("Error parsing SRHI responses:", error);
      return {};
    }
  };

  return (
    <div>
      {habit?.habit_reflections && habit.habit_reflections.length > 0 ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {habit.habit_reflections
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((ref: any, index: number) => (
              <div key={index} className="border p-4 rounded-lg space-y-2">
                <div className="text-sm text-gray-500">
                  {format(new Date(ref.created_at), "dd.MM.yyyy", { locale: de })}
                </div>
                
                {ref.reflection_text && (
                  <div>
                    <h4 className="font-medium text-sm">Reflexion</h4>
                    <p className="text-sm">{ref.reflection_text}</p>
                  </div>
                )}
                
                {ref.obstacles && (
                  <div>
                    <h4 className="font-medium text-sm">Hürden & Hindernisse</h4>
                    <p className="text-sm">{ref.obstacles}</p>
                  </div>
                )}
                
                {ref.srhi_responses && (
                  <div>
                    <h4 className="font-medium text-sm">SRHI-Antworten</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(formatSrhiResponse(ref.srhi_responses)).map(([idx, val]) => (
                        <li key={idx}>
                          {questions[parseInt(idx)]}: {String(val)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Noch keine Reflexionen vorhanden.
        </div>
      )}
      
      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onClose} className="w-full">
          Schließen
        </Button>
      </DialogFooter>
    </div>
  );
};
