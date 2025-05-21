
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChallengeCard, ChallengeProps } from "./ChallengeCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Search, Filter, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateChallengeDialog } from "./CreateChallengeDialog";
import { useNavigate } from "react-router-dom";

// Sample data for demo
const SAMPLE_CHALLENGES: ChallengeProps[] = [
  {
    id: '1',
    title: '100 km Laufen',
    description: 'Gemeinsam 100 km in einem Monat laufen',
    category: 'Fitness',
    target: {
      value: 100,
      unit: 'km'
    },
    currentProgress: 63,
    endDate: '2025-04-05',
    participants: [
      { id: '1', name: 'Anna Schmidt', avatar: '', progress: 15 },
      { id: '2', name: 'Max Mustermann', avatar: '', progress: 22 },
      { id: '3', name: 'Laura Meyer', avatar: '', progress: 10 },
      { id: '4', name: 'Thomas Weber', avatar: '', progress: 8 },
      { id: '5', name: 'Sarah Wagner', avatar: '', progress: 5 },
      { id: '6', name: 'Michael Becker', avatar: '', progress: 3 }
    ],
    isJoined: true
  },
  {
    id: '2',
    title: '30 Tage Meditation',
    description: 'Jeden Tag 10 Minuten meditieren',
    category: 'Achtsamkeit',
    target: {
      value: 300,
      unit: 'Minuten'
    },
    currentProgress: 210,
    endDate: '2025-04-15',
    participants: [
      { id: '1', name: 'Anna Schmidt', avatar: '', progress: 70 },
      { id: '2', name: 'Max Mustermann', avatar: '', progress: 80 },
      { id: '3', name: 'Sarah Wagner', avatar: '', progress: 60 }
    ],
    isJoined: false
  },
  {
    id: '3',
    title: '1000 Seiten lesen',
    description: 'Gemeinsam 1000 Seiten in zwei Monaten lesen',
    category: 'Bildung',
    target: {
      value: 1000,
      unit: 'Seiten'
    },
    currentProgress: 450,
    endDate: '2025-04-05',
    participants: [
      { id: '1', name: 'Laura Meyer', avatar: '', progress: 150 },
      { id: '2', name: 'Thomas Weber', avatar: '', progress: 125 },
      { id: '3', name: 'Sarah Wagner', avatar: '', progress: 100 },
      { id: '4', name: 'Michael Becker', avatar: '', progress: 75 }
    ],
    isJoined: true
  }
];

export const CommunityChallenges = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [challenges, setChallenges] = useState<ChallengeProps[]>(SAMPLE_CHALLENGES);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });
  
  // Get real challenges from the database
  const { data: realChallenges, refetch: refetchChallenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*');
        
      if (error) throw error;
      
      // Map database challenges to correct format
      const mappedChallenges = await Promise.all(data.map(async (challenge) => {
        // Get participants
        const { data: participantsData } = await supabase
          .from('challenge_participants')
          .select('user_id, progress')
          .eq('challenge_id', challenge.id);
        
        // Get profiles for participants
        const participants = await Promise.all((participantsData || []).map(async (participant) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', participant.user_id)
            .single();
            
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
          description: challenge.description,
          category: challenge.category,
          target: {
            value: challenge.target_value,
            unit: challenge.target_unit
          },
          currentProgress: totalProgress,
          endDate: challenge.end_date,
          participants,
          isJoined: !!participantsData?.some(p => p.user_id === session?.user?.id),
          legacyId: challenge.legacy_id
        };
      }));
      
      return mappedChallenges;
    },
    enabled: !!session?.user?.id
  });

  // Get challenge participants
  const { data: participations } = useQuery({
    queryKey: ['user-participations', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          id, 
          challenge_id, 
          user_id, 
          progress
        `)
        .eq('user_id', session!.user.id);
      
      if (error) throw error;
      return data;
    },
    initialData: []
  });

  // Update challenges with real data and user participation
  useEffect(() => {
    if (realChallenges && realChallenges.length > 0) {
      setChallenges([...realChallenges, ...SAMPLE_CHALLENGES.filter(c => 
        !realChallenges.some(rc => rc.id === c.id || rc.legacyId === c.id))]);
    } else if (participations && participations.length > 0) {
      const updatedChallenges = SAMPLE_CHALLENGES.map(challenge => {
        const participation = participations.find(p => p.challenge_id === challenge.id);
        return {
          ...challenge,
          isJoined: !!participation
        };
      });
      setChallenges(updatedChallenges);
    } else {
      setChallenges(SAMPLE_CHALLENGES);
    }
  }, [realChallenges, participations]);
  
  const filteredChallenges = challenges.filter(challenge => 
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const joinedChallenges = filteredChallenges.filter(challenge => 
    challenge.isJoined || participations?.some(p => p.challenge_id === challenge.id)
  );
  
  const availableChallenges = filteredChallenges.filter(challenge => 
    !challenge.isJoined && !participations?.some(p => p.challenge_id === challenge.id)
  );
  
  const handleCreateChallenge = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Challenges durchsuchen..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" onClick={handleCreateChallenge}>
            <Plus className="h-4 w-4 mr-2" />
            Neue Challenge
          </Button>
        </div>
      </div>
      
      {joinedChallenges.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-xl mb-6 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Deine Challenges
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id}
                  {...challenge}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-6">Verfügbare Challenges</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableChallenges.length > 0 ? (
              availableChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id}
                  {...challenge}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Keine Challenges gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Create Challenge Dialog */}
      <CreateChallengeDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onChallengeCreated={(challengeId) => {
          refetchChallenges();
          navigate(`/community-challenge/${challengeId}`);
        }}
      />
    </div>
  );
};
