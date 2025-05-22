
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChallengeCard, ChallengeProps } from "./ChallengeCard";
import { Users, Search, Filter, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateChallengeDialog } from "./CreateChallengeDialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";

// Sample data for demo and fallback - we'll use this only if real data fails to load
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
  const [challenges, setChallenges] = useState<ChallengeProps[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  
  // Get real challenges from the database
  const { data: realChallenges, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      if (!user?.id) {
        console.warn("No user ID available for fetching challenges");
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('community_challenges')
          .select('*');
          
        if (error) {
          console.error("Error fetching challenges:", error);
          throw error;
        }
        
        // Map database challenges to correct format
        const mappedChallenges = await Promise.all((data || []).map(async (challenge) => {
          // Get participants
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
          
          const isJoined = !!participantsData?.some(p => p.user_id === user?.id);
          
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
            participants,
            isJoined
          };
        }));
        
        return mappedChallenges;
      } catch (error) {
        console.error("Error in challenges query:", error);
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Get challenge participations
  const { data: participations } = useQuery({
    queryKey: ['user-participations', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          id, 
          challenge_id, 
          user_id, 
          progress
        `)
        .eq('user_id', user!.id);
      
      if (error) {
        console.error("Error fetching participations:", error);
        throw error;
      }
      
      return data || [];
    }
  });
  
  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) {
        toast({
          title: "Nicht angemeldet",
          description: "Du musst angemeldet sein, um einer Challenge beizutreten.",
          variant: "destructive"
        });
        throw new Error("Not authenticated");
      }
      
      console.log("Joining challenge with user ID:", user.id);
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0
        })
        .select();
        
      if (error) {
        console.error("Error joining challenge:", error);
        throw error;
      }
      
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-participations', user?.id] });
      toast({
        title: "Challenge beigetreten",
        description: "Du bist der Challenge erfolgreich beigetreten."
      });
    },
    onError: (error) => {
      console.error("Join error:", error);
      toast({
        title: "Beitritt fehlgeschlagen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });
  
  // Leave challenge mutation
  const leaveChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) {
        toast({
          title: "Nicht angemeldet",
          description: "Du musst angemeldet sein, um eine Challenge zu verlassen.",
          variant: "destructive"
        });
        throw new Error("Not authenticated");
      }
      
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId);
        
      if (error) {
        console.error("Error leaving challenge:", error);
        throw error;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-participations', user?.id] });
      toast({
        title: "Challenge verlassen",
        description: "Du hast die Challenge erfolgreich verlassen."
      });
    },
    onError: (error) => {
      console.error("Leave error:", error);
      toast({
        title: "Aktion fehlgeschlagen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });

  // Update challenges with real data and user participation
  useEffect(() => {
    if (realChallenges && realChallenges.length > 0) {
      setChallenges(realChallenges);
    } else if (!isLoading) {
      // If no real challenges or still loading, use sample data
      setChallenges(SAMPLE_CHALLENGES);
    }
  }, [realChallenges, isLoading]);
  
  const filteredChallenges = challenges.filter(challenge => 
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const joinedChallenges = filteredChallenges.filter(challenge => challenge.isJoined);
  const availableChallenges = filteredChallenges.filter(challenge => !challenge.isJoined);

  const handleCreateChallenge = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleChallengeCreated = (challengeId: string) => {
    queryClient.invalidateQueries({ queryKey: ['challenges'] });
    navigate(`/community-challenge/${challengeId}`);
  };
  
  const handleJoinChallenge = (challengeId: string) => {
    joinChallengeMutation.mutate(challengeId);
  };
  
  const handleLeaveChallenge = (challengeId: string) => {
    leaveChallengeMutation.mutate(challengeId);
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
      
      {isLoading ? (
        <Card>
          <CardContent className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </CardContent>
        </Card>
      ) : (
        <>
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
                      onJoin={handleJoinChallenge}
                      onLeave={handleLeaveChallenge}
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
                      onJoin={handleJoinChallenge}
                      onLeave={handleLeaveChallenge}
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
        </>
      )}
      
      {/* Create Challenge Dialog */}
      <CreateChallengeDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onChallengeCreated={handleChallengeCreated}
      />
    </div>
  );
};
