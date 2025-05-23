
import { Button } from "@/components/ui/button";
import { Camera, Users } from "lucide-react";

interface ChallengeActionButtonsProps {
  isParticipating: boolean;
  isJoinPending: boolean;
  isLeavePending: boolean;
  onJoinLeave: () => void;
  onAddProof: () => void;
  onManageParticipants: () => void;
}

export const ChallengeActionButtons = ({
  isParticipating,
  isJoinPending,
  isLeavePending,
  onJoinLeave,
  onAddProof,
  onManageParticipants
}: ChallengeActionButtonsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {isParticipating ? (
        <>
          <Button 
            onClick={onAddProof}
            className="bg-green-600 hover:bg-green-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Fortschritt hinzufügen
          </Button>
          
          <Button 
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={onJoinLeave}
            disabled={isLeavePending}
          >
            Challenge verlassen
          </Button>
        </>
      ) : (
        <Button 
          onClick={onJoinLeave}
          disabled={isJoinPending}
        >
          {isJoinPending ? 
            "Wird bearbeitet..." : "Challenge beitreten"}
        </Button>
      )}
      
      <Button 
        variant="outline"
        onClick={onManageParticipants}
      >
        <Users className="h-4 w-4 mr-2" />
        Teilnehmer verwalten
      </Button>
    </div>
  );
};
