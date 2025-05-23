
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Trophy, Plus } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  progress: number;
}

interface Challenge {
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
}

export const SubscribedChallenges = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Get user participations
  const { data: participations, isLoading: isParticipationsLoading } = useQuery({
    queryKey: ['user-participations', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          id, 
          challenge_id, 
          progress
        `)
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error fetching participations:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Get all challenges the user is participating in
  const { data: userChallenges, isLoading: isChallengesLoading } = useQuery({
    queryKey: ['user-subscribed-challenges', participations],
    enabled: !!participations && participations.length > 0,
    queryFn: async () => {
      const challengeIds = participations?.map(p => p.challenge_id) || [];
      
      if (challengeIds.length === 0) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('community_challenges')
          .select('*')
          .in('id', challengeIds);
        
        if (error) {
          console.error("Error fetching challenges:", error);
          throw error;
        }
        
        // Map database challenges to correct format and include user progress
        return Promise.all((data || []).map(async (challenge) => {
          // Get all participants for this challenge
          const { data: participantsData, error: participantsError } = await supabase
            .from('challenge_participants')
            .select('user_id, progress')
            .eq('challenge_id', challenge.id);
          
          if (participantsError) {
            console.error("Error fetching participants:", participantsError);
            throw participantsError;
          }
          
          // Get profiles for participants
          const participants = await Promise.all((participantsData || []).map(async (participant) => {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', participant.user_id)
              .maybeSingle();
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error("Error fetching profile:", profileError);
              throw profileError;
            }
              
            return {
              id: participant.user_id,
              name: profile?.full_name || 'Anonymous User',
              avatar: profile?.avatar_url || '',
              progress: participant.progress || 0
            };
          }));
          
          // Calculate total progress
          const totalProgress = participants.reduce((sum, p) => sum + p.progress, 0);
          
          // Find user's progress
          const userProgress = participations.find(p => p.challenge_id === challenge.id)?.progress || 0;
          
          return {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description || "",
            category: challenge.category || "Allgemein",
            target: {
              value: challenge.target_value,
              unit: challenge.target_unit
            },
            currentProgress: totalProgress,
            endDate: challenge.end_date,
            participants
          };
        }));
      } catch (err) {
        // If there's an error with UUID parsing (common with legacy string IDs),
        // try an alternative approach with string comparison
        console.error("Initial fetch failed, trying alternative approach:", err);
        
        // Get all challenges and filter manually
        const { data: allChallenges, error: allError } = await supabase
          .from('community_challenges')
          .select('*');
        
        if (allError) {
          console.error("Error fetching all challenges:", allError);
          throw allError;
        }
        
        // Filter challenges that match our challenge IDs
        const matchedChallenges = allChallenges.filter(c => 
          challengeIds.includes(c.id) || (c.legacy_id && challengeIds.includes(c.legacy_id))
        );
        
        // Map to the correct format
        return Promise.all(matchedChallenges.map(async (challenge) => {
          // Get all participants for this challenge
          const { data: participantsData } = await supabase
            .from('challenge_participants')
            .select('user_id, progress')
            .eq('challenge_id', challenge.id);
          
          const participants = await Promise.all((participantsData || []).map(async (participant) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', participant.user_id)
              .maybeSingle();
              
            return {
              id: participant.user_id,
              name: profile?.full_name || 'Anonymous User',
              avatar: profile?.avatar_url || '',
              progress: participant.progress || 0
            };
          }));
          
          // Calculate total progress
          const totalProgress = participants.reduce((sum, p) => sum + p.progress, 0);
          
          return {
            id: challenge.id,
            title: challenge.title,
            description: challenge.description || "",
            category: challenge.category || "Allgemein",
            target: {
              value: challenge.target_value,
              unit: challenge.target_unit
            },
            currentProgress: totalProgress,
            endDate: challenge.end_date,
            participants
          };
        }));
      }
    }
  });

  const isLoading = isParticipationsLoading || isChallengesLoading;

  if (isLoading) {
    return <div className="animate-pulse p-4">Lädt Challenges...</div>;
  }

  if (!userChallenges || userChallenges.length === 0) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-semibold mb-2">Deine Community Challenges</h3>
        <p className="text-gray-500 mb-4">Du nimmst noch an keinen Community Challenges teil.</p>
        <Button onClick={() => navigate('/community')}>
          <Plus className="h-4 w-4 mr-2" />
          Challenge beitreten
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Deine Community Challenges</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/community')} className="text-blue-600">
          Alle ansehen
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {userChallenges.map(challenge => {
          const progress = Math.round((challenge.currentProgress / challenge.target.value) * 100);
          
          return (
            <div 
              key={challenge.id}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/community-challenge/${challenge.id}`)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{challenge.title}</h4>
                  <p className="text-sm text-gray-500">{challenge.description}</p>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{challenge.participants.length}</span>
                </div>
              </div>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {challenge.currentProgress} / {challenge.target.value} {challenge.target.unit}
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
