
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  progress: number;
  user_id?: string;
}

export interface ChallengeProps {
  id: string;
  title: string;
  description: string;
  category: string;
  target: {
    value: number;
    unit: string;
  };
  currentProgress: number;
  endDate: string;
  participants: Participant[];
  isJoined?: boolean;
  onJoin?: (challengeId: string) => void;
  onLeave?: (challengeId: string) => void;
}

export const ChallengeCard = ({ 
  id, 
  title, 
  description, 
  category, 
  target, 
  currentProgress, 
  endDate, 
  participants, 
  isJoined = false,
  onJoin,
  onLeave
}: ChallengeProps) => {
  const navigate = useNavigate();
  const progressPercentage = Math.min(100, Math.round((currentProgress / target.value) * 100));
  
  const displayedParticipants = participants.slice(0, 5);
  const remainingParticipants = participants.length - 5;
  
  // Get current user session
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  // Get user profile information to display in participants list
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session!.user.id)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        throw error;
      }
      return data;
    }
  });

  // Check if user is participating
  const { data: userParticipation } = useQuery({
    queryKey: ['user-participation', id, session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', id)
        .eq('user_id', session!.user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Override isJoined with the actual participation status from the database
  const realIsJoined = userParticipation ? true : isJoined;

  const handleJoinOrView = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      toast.error("Du musst angemeldet sein, um einer Challenge beizutreten.");
      return;
    }
    
    if (realIsJoined) {
      navigate(`/community-challenge/${id}`);
    } else if (onJoin) {
      onJoin(id);
    } else {
      navigate(`/community-challenge/${id}`);
    }
  };

  const handleLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      toast.error("Du musst angemeldet sein, um eine Challenge zu verlassen.");
      return;
    }
    
    if (onLeave) {
      onLeave(id);
    }
  };

  return (
    <Card className="p-6 hover:shadow-md transition-shadow border border-blue-100/60 cursor-pointer" onClick={() => navigate(`/community-challenge/${id}`)}>
      <div className="flex flex-col h-full">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200">
              {category}
            </Badge>
            <h3 className="font-bold text-xl text-gray-800 mb-1">{title}</h3>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Trophy className="h-4 w-4 mr-1.5 text-blue-600" />
            <span>
              Ziel: {target.value} {target.unit}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1.5 text-blue-600" />
            <span>Endet am {new Date(endDate).toLocaleDateString('de-DE')}</span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">Fortschritt</span>
            <span className="text-blue-700">
              {currentProgress} von {target.value} {target.unit} ({progressPercentage}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex -space-x-2">
            {displayedParticipants.map((participant, i) => (
              <Avatar key={participant.id} className="h-7 w-7 border-2 border-white">
                <AvatarImage src={participant.avatar} alt={participant.name} />
                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                  {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
            {remainingParticipants > 0 && (
              <div className="h-7 w-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                +{remainingParticipants}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="h-4 w-4" />
            <span className="text-sm">{participants.length}</span>
          </div>
        </div>

        {realIsJoined ? (
          <div className="mt-4 flex gap-2">
            <Button 
              variant="default" 
              className="w-full"
              onClick={handleJoinOrView}
            >
              Zur Challenge
            </Button>
            {onLeave && (
              <Button 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleLeave}
              >
                Verlassen
              </Button>
            )}
          </div>
        ) : (
          <Button 
            variant="default" 
            className="mt-4 w-full"
            onClick={handleJoinOrView}
          >
            Beitreten
          </Button>
        )}
      </div>
    </Card>
  );
};
