
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Trophy, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProofCircle } from "./ProofCircle";

type ProofItem = {
  id: string;
  user_id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  progress_value: number;
  user_name?: string;
  user_avatar?: string;
}

export const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });
  
  // Check if user is participating
  const { data: participation } = useQuery({
    queryKey: ['challenge-participation', id, session?.user?.id],
    enabled: !!id && !!session?.user?.id,
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
  
  // Get challenge proofs
  const { data: proofs } = useQuery({
    queryKey: ['challenge-proofs', id],
    enabled: !!id,
    queryFn: async () => {
      // Custom query implementation to avoid TypeScript issues
      const { data, error } = await supabase
        .from('challenge_proofs')
        .select(`
          id,
          user_id,
          challenge_id,
          image_url,
          progress_value,
          created_at,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('challenge_id', id as string)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      // Transform the data to match our expected format
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        challenge_id: item.challenge_id,
        image_url: item.image_url,
        progress_value: item.progress_value,
        created_at: item.created_at,
        user_name: item.profiles?.full_name,
        user_avatar: item.profiles?.avatar_url
      })) as ProofItem[];
    }
  });
  
  // Sample challenge data - in a real app, this would come from the database
  const challenge = {
    id: id,
    title: id === '1' ? '100 km Laufen' : id === '3' ? '1000 Seiten lesen' : 'Challenge',
    description: id === '1' ? 
      'Gemeinsam 100 km in einem Monat laufen - für mehr Bewegung und Gesundheit!' : 
      id === '3' ? 'Gemeinsam 1000 Seiten in zwei Monaten lesen - für mehr Wissen und geistige Fitness!' : 
      'Eine gemeinsame Challenge für mehr Motivation!',
    category: id === '1' ? 'Fitness' : id === '3' ? 'Bildung' : 'Allgemein',
    target: { 
      value: id === '1' ? 100 : id === '3' ? 1000 : 50, 
      unit: id === '1' ? 'km' : id === '3' ? 'Seiten' : 'Einheiten' 
    },
    currentProgress: id === '1' ? 63 : id === '3' ? 450 : 25,
    endDate: '2025-04-05',
    participants: [
      { id: '1', name: 'Anna Schmidt', avatar: '', progress: 15 },
      { id: '2', name: 'Max Mustermann', avatar: '', progress: 22 },
      { id: '3', name: 'Laura Meyer', avatar: '', progress: 10 },
      { id: '4', name: 'Thomas Weber', avatar: '', progress: 8 },
      { id: '5', name: 'Sarah Wagner', avatar: '', progress: 5 },
      { id: '6', name: 'Michael Becker', avatar: '', progress: 3 }
    ]
  };
  
  const joinChallengeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: session.user.id,
          challenge_id: id!,
          progress: 0
        });
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-participation', id, session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-participations', session?.user?.id] });
      toast({
        title: "Challenge beigetreten",
        description: "Du nimmst jetzt an dieser Challenge teil!",
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
  
  const leaveChallengeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('user_id', session.user.id)
        .eq('challenge_id', id!);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-participation', id, session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-participations', session?.user?.id] });
      toast({
        title: "Challenge verlassen",
        description: "Du nimmst nicht mehr an dieser Challenge teil.",
      });
    },
    onError: (error) => {
      console.error("Leave error:", error);
      toast({
        title: "Verlassen fehlgeschlagen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });
  
  const handleJoinLeave = () => {
    if (participation) {
      leaveChallengeMutation.mutate();
    } else {
      joinChallengeMutation.mutate();
    }
  };
  
  const progressPercentage = Math.min(100, Math.round((challenge.currentProgress / challenge.target.value) * 100));
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate('/community')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Zurück zu Challenges
        </Button>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* Challenge Info */}
              <div className="flex-1">
                <div className="inline-flex h-6 items-center rounded-full bg-blue-100 px-3 text-sm font-medium text-blue-800 mb-3">
                  {challenge.category}
                </div>
                <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
                <p className="text-gray-600 mb-4">{challenge.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-6 text-sm">
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-blue-600 mr-2" />
                    <span>Ziel: {challenge.target.value} {challenge.target.unit}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                    <span>Endet am {new Date(challenge.endDate).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-600 mr-2" />
                    <span>{challenge.participants.length} Teilnehmer</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Gesamtfortschritt</span>
                    <span className="text-blue-700">
                      {challenge.currentProgress} von {challenge.target.value} {challenge.target.unit}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>
                
                <Button 
                  onClick={handleJoinLeave}
                  variant={participation ? "outline" : "default"}
                  className={participation ? "border-red-300 text-red-700 hover:bg-red-50" : ""}
                  disabled={joinChallengeMutation.isPending || leaveChallengeMutation.isPending}
                >
                  {joinChallengeMutation.isPending || leaveChallengeMutation.isPending ? 
                    "Wird bearbeitet..." : 
                    (participation ? "Challenge verlassen" : "Challenge beitreten")}
                </Button>
              </div>
              
              {/* Participants */}
              <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Teilnehmer</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {challenge.participants.map(participant => (
                    <div key={participant.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{participant.name}</span>
                          <span>{participant.progress} {challenge.target.unit}</span>
                        </div>
                        <Progress 
                          value={Math.round((participant.progress / challenge.target.value) * 100)} 
                          className="h-1.5" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Proof Circle with mobile-optimized UI */}
            <ProofCircle challengeId={id || ''} proofs={proofs} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
