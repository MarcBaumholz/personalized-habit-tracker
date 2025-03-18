
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ChallengeProps } from "./ChallengeCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  Calendar, 
  Trophy, 
  TrendingUp,
  ArrowLeft,
  Plus,
  Info,
  Check,
  Clock,
  Target,
  Activity,
  Share2
} from "lucide-react";
import { format, differenceInDays } from "date-fns";

// Sample data for demo with updated dates
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

interface ParticipantData {
  id: string;
  name: string;
  avatar: string;
  progress: number;
  user_id?: string; // For matching with current user
}

interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newProgress, setNewProgress] = useState("");
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [userParticipation, setUserParticipation] = useState<ChallengeParticipant | null>(null);
  
  // Get challenge data
  const { data: challenge, isLoading: isLoadingChallenge } = useQuery({
    queryKey: ['challenge', id],
    queryFn: async () => {
      // For now, use the sample data
      const foundChallenge = SAMPLE_CHALLENGES.find(c => c.id === id);
      if (!foundChallenge) {
        throw new Error("Challenge not found");
      }
      return foundChallenge;
    }
  });
  
  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session!.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Get participants with their profiles
  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['challenge-participants', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          id,
          challenge_id,
          user_id,
          progress,
          created_at,
          profiles:user_id(id, full_name, avatar_url, username)
        `)
        .eq('challenge_id', id);
      
      if (error) throw error;
      
      // Transform data to participants format
      return data.map((p): ParticipantData => ({
        id: p.id,
        user_id: p.user_id,
        name: p.profiles?.full_name || p.profiles?.username || 'Anonymous User',
        avatar: p.profiles?.avatar_url || '',
        progress: p.progress || 0
      }));
    },
    initialData: challenge?.participants || []
  });

  // Calculate total progress
  const totalProgress = participants?.reduce((sum, p) => sum + p.progress, 0) || 0;

  // Check if user is already participating
  useEffect(() => {
    if (session?.user?.id && participants) {
      const userParticipant = participants.find(
        p => p.user_id === session.user.id
      );
      
      if (userParticipant) {
        setUserParticipation({
          id: userParticipant.id,
          challenge_id: id!,
          user_id: session.user.id,
          progress: userParticipant.progress,
          created_at: new Date().toISOString()
        });
      }
    }
  }, [session, participants, id]);

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("You must be logged in to join a challenge");
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: id!,
          user_id: session.user.id,
          progress: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setUserParticipation(data);
      toast({
        title: "Challenge beigetreten",
        description: `Du bist jetzt Teil der Challenge ${challenge?.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Beitreten",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Add progress mutation
  const addProgressMutation = useMutation({
    mutationFn: async (progress: number) => {
      if (!userParticipation) throw new Error("You must join the challenge first");
      
      const { data, error } = await supabase
        .from('challenge_participants')
        .update({ 
          progress: userParticipation.progress + progress 
        })
        .eq('id', userParticipation.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setUserParticipation(data);
      toast({
        title: "Fortschritt hinzugefügt",
        description: `Du hast ${newProgress} ${challenge?.target.unit} zu deinem Fortschritt hinzugefügt.`,
      });
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
      setNewProgress("");
      setIsAddProgressOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler beim Hinzufügen des Fortschritts",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleJoinChallenge = () => {
    joinChallengeMutation.mutate();
  };

  const handleAddProgress = () => {
    if (!newProgress || isNaN(Number(newProgress)) || Number(newProgress) <= 0) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte gib einen gültigen Wert ein.",
        variant: "destructive",
      });
      return;
    }
    
    addProgressMutation.mutate(Number(newProgress));
  };
  
  if (isLoadingChallenge) {
    return (
      <div className="container max-w-4xl mx-auto p-8 text-center">
        <div className="p-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-2">Laden...</h2>
          <p className="text-gray-600 mb-6">Die Challenge-Daten werden geladen.</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container max-w-4xl mx-auto p-8 text-center">
        <div className="p-12 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold mb-2">Challenge nicht gefunden</h2>
          <p className="text-gray-600 mb-6">Die gesuchte Challenge konnte nicht gefunden werden.</p>
          <Button onClick={() => navigate('/toolbox')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min(100, Math.round((totalProgress / challenge.target.value) * 100));
  
  // Calculate days remaining until the end date
  const today = new Date();
  const endDate = new Date(challenge.endDate);
  const daysRemaining = Math.max(0, differenceInDays(endDate, today));
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <Button 
        variant="outline" 
        className="mb-6" 
        onClick={() => navigate('/toolbox')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Zurück zur Übersicht
      </Button>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200">
                    {challenge.category}
                  </Badge>
                  <CardTitle className="text-2xl">{challenge.title}</CardTitle>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">{challenge.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Ziel</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">
                    {challenge.target.value} {challenge.target.unit}
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Enddatum</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">
                    {format(new Date(challenge.endDate), 'dd.MM.yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">Gruppenfortschritt</span>
                  <span className="text-blue-700">
                    {totalProgress} von {challenge.target.value} {challenge.target.unit} ({progressPercentage}%)
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              
              {userParticipation ? (
                <Dialog open={isAddProgressOpen} onOpenChange={setIsAddProgressOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Fortschritt hinzufügen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Fortschritt hinzufügen</DialogTitle>
                      <DialogDescription>
                        Trage deinen Fortschritt für die Challenge "{challenge.title}" ein.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-4">
                        <Input
                          type="number"
                          placeholder={`Anzahl in ${challenge.target.unit}`}
                          value={newProgress}
                          onChange={(e) => setNewProgress(e.target.value)}
                          min="0"
                          step="0.01"
                        />
                        <span className="text-gray-500 whitespace-nowrap">{challenge.target.unit}</span>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddProgressOpen(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={handleAddProgress}>
                        <Check className="h-4 w-4 mr-2" />
                        Bestätigen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={handleJoinChallenge}
                  disabled={joinChallengeMutation.isPending}
                >
                  {joinChallengeMutation.isPending ? "Wird beigetreten..." : "Challenge beitreten"}
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Tabs defaultValue="progress">
            <TabsList className="w-full">
              <TabsTrigger value="progress" className="flex-1">Fortschritt</TabsTrigger>
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="discussion" className="flex-1">Diskussion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fortschritt der Teilnehmer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {participants
                        .sort((a, b) => b.progress - a.progress)
                        .map((participant, index) => {
                          const participantPercentage = Math.round((participant.progress / challenge.target.value) * 100);
                          const isCurrentUser = participant.user_id === session?.user?.id;
                          
                          return (
                            <div key={participant.id} className={`flex items-center gap-4 ${isCurrentUser ? 'bg-blue-50 p-2 rounded-md' : ''}`}>
                              <div className="flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={participant.avatar} alt={participant.name} />
                                  <AvatarFallback className={`${isCurrentUser ? 'bg-blue-200 text-blue-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {participant.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="font-medium text-gray-800 truncate">
                                    {participant.name} {isCurrentUser && '(Du)'}
                                  </p>
                                  <div className="flex items-center">
                                    <Badge 
                                      variant="outline" 
                                      className={`mr-2 ${index < 3 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50'}`}
                                    >
                                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {participant.progress} {challenge.target.unit}
                                    </span>
                                  </div>
                                </div>
                                <Progress value={participantPercentage} className="h-2" />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="details" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Challenge-Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Beschreibung</h4>
                      <p className="text-gray-600">
                        {challenge.description}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Regeln</h4>
                      <ul className="list-disc pl-5 text-gray-600 space-y-1">
                        <li>Jeder Teilnehmer trägt seinen individuellen Fortschritt ein</li>
                        <li>Die Fortschritte werden zum Gruppenfortschritt zusammengezählt</li>
                        <li>Die Challenge endet am {new Date(challenge.endDate).toLocaleDateString('de-DE')}</li>
                        <li>Alle Aktivitäten müssen ehrlich und korrekt eingetragen werden</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Tipps</h4>
                      <ul className="list-disc pl-5 text-gray-600 space-y-1">
                        <li>Regelmäßiges Tracken hilft, den Überblick zu behalten</li>
                        <li>Unterstütze andere Teilnehmer mit motivierenden Kommentaren</li>
                        <li>Teile deine Erfolge und Herausforderungen in der Diskussion</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="discussion" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Diskussion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Info className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Die Diskussionsfunktion wird bald verfügbar sein.</p>
                    <p className="text-gray-400 text-sm mt-2">Hier kannst du dich mit anderen Teilnehmern austauschen.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team-Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Teilnehmer</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">{participants.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Aktivitätsrate</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">78%</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Verbleibend</span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">{daysRemaining} Tage</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Target className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Ziel-Prognose</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {progressPercentage >= 50 ? "Erreichbar" : "Herausfordernd"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Beitragende</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {participants
                  .sort((a, b) => b.progress - a.progress)
                  .slice(0, 3)
                  .map((participant, index) => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0 text-lg font-bold text-blue-700 w-5">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </div>
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={participant.avatar} alt={participant.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                            {participant.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{participant.name}</span>
                      </div>
                      <span className="text-blue-700 font-semibold">
                        {participant.progress} {challenge.target.unit}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
