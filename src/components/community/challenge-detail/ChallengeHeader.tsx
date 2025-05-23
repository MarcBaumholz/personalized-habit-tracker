
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Trophy, Users, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChallengeHeaderProps {
  title: string;
  category: string;
  description: string;
  target: { value: number; unit: string };
  endDate: string;
  participantsCount: number;
  canEdit: boolean;
  onEditClick: () => void;
}

export const ChallengeHeader = ({
  title,
  category,
  description,
  target,
  endDate,
  participantsCount,
  canEdit,
  onEditClick,
}: ChallengeHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate('/community')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Zurück zu Challenges
      </Button>
      
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        {canEdit && (
          <Button 
            onClick={onEditClick}
            className="bg-blue-600"
          >
            <Edit className="h-4 w-4 mr-2" />
            Challenge bearbeiten
          </Button>
        )}
      </div>

      <div className="inline-flex h-6 items-center rounded-full bg-blue-100 px-3 text-sm font-medium text-blue-800 mb-3">
        {category}
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-4 mb-6 text-sm">
        <div className="flex items-center">
          <Trophy className="h-4 w-4 text-blue-600 mr-2" />
          <span>Ziel: {target.value} {target.unit}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-blue-600 mr-2" />
          <span>Endet am {new Date(endDate).toLocaleDateString('de-DE')}</span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 text-blue-600 mr-2" />
          <span>{participantsCount} Teilnehmer</span>
        </div>
      </div>
    </>
  );
};
