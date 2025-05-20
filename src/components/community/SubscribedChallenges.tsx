
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronRight, Users, Trophy, Plus } from "lucide-react";

export const SubscribedChallenges = () => {
  const navigate = useNavigate();
  
  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  // Get user participations
  const { data: participations, isLoading } = useQuery({
    queryKey: ['user-participations', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          id, 
          challenge_id, 
          progress,
          user_id
        `)
        .eq('user_id', session!.user.id);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Sample challenges data - in a real app, this would come from the database
  const SAMPLE_CHALLENGES = [
    {
      id: '1',
      title: '100 km Laufen',
      description: 'Gemeinsam 100 km in einem Monat laufen',
      category: 'Fitness',
      target: { value: 100, unit: 'km' },
      currentProgress: 63,
      endDate: '2025-04-05',
      participants: 6
    },
    {
      id: '3',
      title: '1000 Seiten lesen',
      description: 'Gemeinsam 1000 Seiten in zwei Monaten lesen',
      category: 'Bildung',
      target: { value: 1000, unit: 'Seiten' },
      currentProgress: 450,
      endDate: '2025-04-05',
      participants: 4
    }
  ];

  // Filter only challenges the user is participating in
  const subscribedChallenges = SAMPLE_CHALLENGES.filter(challenge => 
    participations?.some(p => p.challenge_id === challenge.id)
  );

  if (isLoading) {
    return <div className="animate-pulse p-4">Lädt Challenges...</div>;
  }

  if (subscribedChallenges.length === 0) {
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
        {subscribedChallenges.map(challenge => {
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
                  <span>{challenge.participants}</span>
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
