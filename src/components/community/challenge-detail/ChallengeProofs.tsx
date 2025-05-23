
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { ProofCarousel } from "./ProofCarousel";

interface Profile {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

interface ProofItem {
  id: string;
  user_id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  progress_value: number;
  profiles?: Profile | null;
}

interface GroupedProofs {
  [date: string]: ProofItem[];
}

interface ChallengeProofsProps {
  groupedProofs: GroupedProofs;
  targetUnit: string;
  currentUserId?: string;
  isParticipating: boolean;
  onAddProofClick: () => void;
  onDeleteProof: (proof: ProofItem) => void;
}

export const ChallengeProofs = ({
  groupedProofs,
  targetUnit,
  currentUserId,
  isParticipating,
  onAddProofClick,
  onDeleteProof
}: ChallengeProofsProps) => {
  const hasProofs = Object.keys(groupedProofs).length > 0;
  
  return (
    <div className="mt-8">
      <h3 className="font-semibold text-lg mb-4">Beweise & Fortschritte</h3>
      
      {hasProofs ? (
        <div className="space-y-6">
          {Object.entries(groupedProofs).map(([date, dateProofs]) => (
            <ProofCarousel 
              key={date}
              date={date}
              proofs={dateProofs}
              targetUnit={targetUnit}
              currentUserId={currentUserId}
              onDeleteProof={onDeleteProof}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-md">
          <p className="text-gray-500">Noch keine Beweise für diese Challenge.</p>
          {isParticipating && (
            <Button 
              onClick={onAddProofClick}
              variant="outline" 
              className="mt-2"
            >
              <Camera className="h-4 w-4 mr-2" />
              Sei der Erste
            </Button>
          )}
        </div>
      )}
      
      {/* Mobile: Add proof floating button */}
      {isParticipating && (
        <div className="md:hidden fixed bottom-6 right-6 z-10">
          <Button
            onClick={onAddProofClick}
            className="h-14 w-14 rounded-full bg-blue-600 shadow-lg p-0 flex items-center justify-center"
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
};
