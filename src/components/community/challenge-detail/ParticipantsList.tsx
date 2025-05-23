
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  progress: number;
}

interface ParticipantsListProps {
  participants: Participant[];
  targetValue: number;
  targetUnit: string;
}

export const ParticipantsList = ({ 
  participants, 
  targetValue, 
  targetUnit 
}: ParticipantsListProps) => {
  return (
    <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg">
      <h3 className="font-semibold mb-4">Teilnehmer</h3>
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {participants.map(participant => (
          <div key={participant.id} className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{participant.name}</span>
                <span>{participant.progress} {targetUnit}</span>
              </div>
              <Progress 
                value={Math.round((participant.progress / targetValue) * 100)} 
                className="h-1.5" 
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
