
import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Trophy, Users, Edit, Trash2, Camera, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProofCircle } from "./ProofCircle";
import { useState, useEffect } from "react";
import { EditChallengeDialog } from "./EditChallengeDialog";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define proper types for user profile and proof data
type Profile = {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

type ProofItem = {
  id: string;
  user_id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  progress_value: number;
  profiles?: Profile | null;
}

type Participant = {
  id: string;
  name: string;
  avatar: string;
  progress: number;
}

type ChallengeData = {
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
  created_by?: string;
}

// Group proofs by date for the carousel
type GroupedProofs = {
  [date: string]: ProofItem[];
}

export const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isManageParticipantsOpen, setIsManageParticipantsOpen] = useState(false);
  const [isAddProofOpen, setIsAddProofOpen] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [groupedProofs, setGroupedProofs] = useState<GroupedProofs>({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeleteProofDialogOpen, setIsDeleteProofDialogOpen] = useState(false);
  const [proofToDelete, setProofToDelete] = useState<ProofItem | null>(null);
  const [realChallenge, setRealChallenge] = useState<any>(null);
  
  // Get current user
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
  });
  
  // Get challenge data
  const { data: challengeData, isLoading: isChallengeLoading } = useQuery({
    queryKey: ['challenge-data', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('id', id as string)
        .single();
      
      // Also query for challenges that match legacy_id (for backwards compatibility)
      if (error) {
        const { data: legacyData, error: legacyError } = await supabase
          .from('community_challenges')
          .select('*')
          .eq('legacy_id', id as string)
          .single();
        
        if (legacyError) throw error;
        return legacyData;
      }
      
      return data;
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
  
  // Get all participants with profile information
  const { data: challengeParticipants } = useQuery({
    queryKey: ['challenge-participants', id],
    enabled: !!id,
    queryFn: async () => {
      // First fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', id as string);
        
      if (participantsError) throw participantsError;
      
      // Then fetch profiles for each participant
      const participantsWithProfiles = await Promise.all(
        participantsData.map(async (participant) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', participant.user_id)
            .single();
            
          return {
            ...participant,
            profile: profileData
          };
        })
      );
      
      return participantsWithProfiles;
    }
  });
  
  // Get challenge proofs with profile information
  const { data: proofs } = useQuery({
    queryKey: ['challenge-proofs', id],
    enabled: !!id,
    queryFn: async () => {
      // First fetch proofs
      const { data: proofsData, error: proofsError } = await supabase
        .from('challenge_proofs')
        .select('*')
        .eq('challenge_id', id as string)
        .order('created_at', { ascending: false });
        
      if (proofsError) throw proofsError;
      
      // Then fetch profiles for each proof
      const proofsWithProfiles = await Promise.all(
        proofsData.map(async (proof) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', proof.user_id)
            .single();
            
          return {
            id: proof.id,
            user_id: proof.user_id,
            challenge_id: proof.challenge_id,
            image_url: proof.image_url,
            progress_value: proof.progress_value || 0,
            created_at: proof.created_at,
            profiles: profileData
          } as ProofItem;
        })
      );
      
      return proofsWithProfiles;
    }
  });
  
  // Transform participants data when it changes
  useEffect(() => {
    if (challengeParticipants && challengeParticipants.length > 0) {
      // Create participant list from real data with safe null checking
      const mappedParticipants = challengeParticipants.map(p => ({
        id: p.user_id,
        name: p.profile?.full_name || 'Anonymous User',
        avatar: p.profile?.avatar_url || '',
        progress: p.progress || 0
      }));
      
      setParticipants(mappedParticipants);
      
      // Calculate total progress
      const total = mappedParticipants.reduce((sum, p) => sum + p.progress, 0);
      setTotalProgress(total);
    }
  }, [challengeParticipants]);
  
  // Group proofs by date when proof data changes
  useEffect(() => {
    if (proofs && proofs.length > 0) {
      const grouped = proofs.reduce((acc, proof) => {
        // Format date as YYYY-MM-DD
        const date = new Date(proof.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(proof);
        return acc;
      }, {} as GroupedProofs);
      
      setGroupedProofs(grouped);
    }
  }, [proofs]);
  
  // Update real challenge from database data
  useEffect(() => {
    if (challengeData) {
      setRealChallenge({
        id: challengeData.id,
        title: challengeData.title,
        description: challengeData.description,
        category: challengeData.category,
        target: {
          value: challengeData.target_value,
          unit: challengeData.target_unit
        },
        endDate: challengeData.end_date,
        created_by: challengeData.created_by
      });
    }
  }, [challengeData]);
  
  // Sample challenge data - in a real app, this would come from the database
  const challenge: ChallengeData = realChallenge || {
    id: id || '',
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
    currentProgress: totalProgress || (id === '1' ? 63 : id === '3' ? 450 : 25),
    endDate: '2025-04-05',
    participants: participants.length > 0 ? participants : [
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
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
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
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
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
  
  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: string) => {
      const { data, error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('user_id', participantId)
        .eq('challenge_id', id!);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
      toast({
        title: "Teilnehmer entfernt",
        description: "Der Teilnehmer wurde aus der Challenge entfernt.",
      });
    },
    onError: (error) => {
      console.error("Remove participant error:", error);
      toast({
        title: "Fehler beim Entfernen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });
  
  const addParticipantMutation = useMutation({
    mutationFn: async (email: string) => {
      // First, get the user ID from the email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
        
      if (userError) throw userError;
      
      if (!userData) {
        throw new Error("Benutzer nicht gefunden.");
      }
      
      // Then add the user to the challenge
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: userData.id,
          challenge_id: id!,
          progress: 0
        });
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewParticipantEmail("");
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
      toast({
        title: "Teilnehmer hinzugefügt",
        description: "Der Teilnehmer wurde zur Challenge hinzugefügt.",
      });
    },
    onError: (error) => {
      console.error("Add participant error:", error);
      toast({
        title: "Fehler beim Hinzufügen",
        description: error instanceof Error ? error.message : "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });
  
  // Add proof mutation
  const addProofMutation = useMutation({
    mutationFn: async ({ imageFile, progressValue }: { imageFile: File, progressValue: number }) => {
      if (!session?.user) throw new Error("Not authenticated");
      
      // 1. Upload the image to storage
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('challenge-proofs')
        .upload(`public/${fileName}`, imageFile);
        
      if (uploadError) throw uploadError;
      
      // 2. Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('challenge-proofs')
        .getPublicUrl(`public/${fileName}`);
      
      // 3. Create the proof record
      const { data, error } = await supabase
        .from('challenge_proofs')
        .insert({
          user_id: session.user.id,
          challenge_id: id!,
          image_url: publicUrl,
          progress_value: progressValue
        });
        
      if (error) throw error;
      
      // 4. Update user's progress in the challenge
      const { data: participantData, error: updateError } = await supabase
        .from('challenge_participants')
        .update({ progress: supabase.rpc('increment_participant_progress', { 
          p_user_id: session.user.id,
          p_challenge_id: id!,
          p_progress_value: progressValue
        }) })
        .eq('user_id', session.user.id)
        .eq('challenge_id', id!)
        .select();
        
      if (updateError) throw updateError;
      
      return data;
    },
    onSuccess: () => {
      // Reset form and close dialog
      setProofImage(null);
      setImagePreview(null);
      setProgressValue(0);
      setIsAddProofOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['challenge-proofs', id] });
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
      
      toast({
        title: "Fortschritt hinzugefügt",
        description: "Dein Fortschritt wurde erfolgreich hinzugefügt!",
      });
    },
    onError: (error) => {
      console.error("Add proof error:", error);
      toast({
        title: "Fehler beim Hinzufügen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });
  
  // Delete proof mutation
  const deleteProofMutation = useMutation({
    mutationFn: async (proofId: string) => {
      if (!session?.user) throw new Error("Not authenticated");
      
      // 1. Get the proof details to adjust the progress
      const { data: proofData, error: fetchError } = await supabase
        .from('challenge_proofs')
        .select('*')
        .eq('id', proofId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // 2. Delete the proof record
      const { error: deleteError } = await supabase
        .from('challenge_proofs')
        .delete()
        .eq('id', proofId)
        .eq('user_id', session.user.id); // Ensure only the owner can delete
        
      if (deleteError) throw deleteError;
      
      // 3. Update the user's progress in the challenge
      // First, get current progress
      const { data: currentProgress, error: progressError } = await supabase
        .from('challenge_participants')
        .select('progress')
        .eq('user_id', session.user.id)
        .eq('challenge_id', id!)
        .single();
        
      if (progressError) throw progressError;
      
      // Then update with reduced progress
      const newProgress = Math.max(0, (currentProgress?.progress || 0) - proofData.progress_value);
      
      const { error: updateError } = await supabase
        .from('challenge_participants')
        .update({ progress: newProgress })
        .eq('user_id', session.user.id)
        .eq('challenge_id', id!);
        
      if (updateError) throw updateError;
      
      // 4. Extract filename from URL to delete from storage
      try {
        const url = new URL(proofData.image_url);
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];
        
        if (filename) {
          await supabase.storage
            .from('challenge-proofs')
            .remove([`public/${filename}`]);
        }
      } catch (e) {
        console.error("Error deleting file from storage:", e);
        // Continue even if storage deletion fails
      }
      
      return proofData;
    },
    onSuccess: () => {
      setProofToDelete(null);
      setIsDeleteProofDialogOpen(false);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['challenge-proofs', id] });
      queryClient.invalidateQueries({ queryKey: ['challenge-participants', id] });
      
      toast({
        title: "Beweis gelöscht",
        description: "Der Fortschrittsbeweis wurde erfolgreich gelöscht.",
      });
    },
    onError: (error) => {
      console.error("Delete proof error:", error);
      toast({
        title: "Fehler beim Löschen",
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
  
  const handleAddParticipant = () => {
    if (newParticipantEmail.trim()) {
      addParticipantMutation.mutate(newParticipantEmail);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleAddProof = () => {
    if (proofImage && progressValue > 0) {
      addProofMutation.mutate({ imageFile: proofImage, progressValue });
    } else {
      toast({
        title: "Unvollständige Angaben",
        description: "Bitte wähle ein Bild und gib einen Fortschrittswert ein.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteProof = (proof: ProofItem) => {
    if (user?.id !== proof.user_id) {
      toast({
        title: "Nicht erlaubt",
        description: "Du kannst nur deine eigenen Beweise löschen.",
        variant: "destructive"
      });
      return;
    }
    
    setProofToDelete(proof);
    setIsDeleteProofDialogOpen(true);
  };
  
  const confirmDeleteProof = () => {
    if (proofToDelete) {
      deleteProofMutation.mutate(proofToDelete.id);
    }
  };
  
  const progressPercentage = Math.min(100, Math.round((challenge.currentProgress / challenge.target.value) * 100));
  
  const canEdit = user && (challengeData?.created_by === user.id);
  
  if (isChallengeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container py-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Lade Challenge...</p>
          </div>
        </main>
      </div>
    );
  }
  
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
        
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          {canEdit && (
            <Button 
              onClick={() => setIsEditOpen(true)}
              className="bg-blue-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Challenge bearbeiten
            </Button>
          )}
        </div>
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* Challenge Info */}
              <div className="flex-1">
                <div className="inline-flex h-6 items-center rounded-full bg-blue-100 px-3 text-sm font-medium text-blue-800 mb-3">
                  {challenge.category}
                </div>
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
                
                <div className="flex flex-wrap gap-3">
                  {participation ? (
                    <>
                      <Button 
                        onClick={() => setIsAddProofOpen(true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Fortschritt hinzufügen
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={handleJoinLeave}
                        disabled={leaveChallengeMutation.isPending}
                      >
                        Challenge verlassen
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={handleJoinLeave}
                      disabled={joinChallengeMutation.isPending}
                    >
                      {joinChallengeMutation.isPending ? 
                        "Wird bearbeitet..." : "Challenge beitreten"}
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline"
                    onClick={() => setIsManageParticipantsOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Teilnehmer verwalten
                  </Button>
                </div>
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
            
            {/* Daily Proofs Carousel */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Beweise & Fortschritte</h3>
              
              {Object.keys(groupedProofs).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedProofs).map(([date, dateProofs]) => (
                    <div key={date} className="space-y-2">
                      <h4 className="font-medium text-gray-700">
                        {new Date(date).toLocaleDateString('de-DE', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <Carousel className="w-full">
                        <CarouselContent>
                          {dateProofs.map(proof => (
                            <CarouselItem key={proof.id} className="md:basis-1/3 lg:basis-1/4">
                              <div className="bg-gray-50 rounded-lg p-3 h-full relative">
                                <div className="aspect-square w-full relative overflow-hidden rounded-md mb-2">
                                  <img 
                                    src={proof.image_url} 
                                    alt="Proof" 
                                    className="object-cover w-full h-full" 
                                  />
                                  
                                  {/* Delete button for own proofs */}
                                  {user?.id === proof.user_id && (
                                    <Button 
                                      variant="destructive" 
                                      size="icon" 
                                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-opacity-70"
                                      onClick={() => handleDeleteProof(proof)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={proof.profiles?.avatar_url} />
                                    <AvatarFallback>
                                      {proof.profiles?.full_name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-xs font-medium truncate">
                                      {proof.profiles?.full_name || 'Anonym'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      +{proof.progress_value} {challenge.target.unit}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <p className="text-gray-500">Noch keine Beweise für diese Challenge.</p>
                  {participation && (
                    <Button 
                      onClick={() => setIsAddProofOpen(true)}
                      variant="outline" 
                      className="mt-2"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Sei der Erste
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            {/* Mobile: Add proof floating button */}
            {participation && (
              <div className="md:hidden fixed bottom-6 right-6 z-10">
                <Button
                  onClick={() => setIsAddProofOpen(true)}
                  className="h-14 w-14 rounded-full bg-blue-600 shadow-lg p-0 flex items-center justify-center"
                >
                  <Camera className="h-6 w-6" />
                </Button>
              </div>
            )}
            
            {/* ProofCircle component for legacy support */}
            <div className="hidden">
              <ProofCircle challengeId={id || ''} proofs={proofs || []} />
            </div>
          </CardContent>
        </Card>
        
        {/* Edit Challenge Dialog */}
        <EditChallengeDialog 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
          challengeId={id || ''} 
          challenge={challenge}
        />
        
        {/* Manage Participants Dialog */}
        <Dialog open={isManageParticipantsOpen} onOpenChange={setIsManageParticipantsOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Teilnehmer verwalten</DialogTitle>
              <DialogDescription>
                Hier kannst du Teilnehmer hinzufügen und entfernen.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-4">
              <div className="space-y-2">
                <Label htmlFor="new-participant">Neuen Teilnehmer hinzufügen</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="new-participant" 
                    placeholder="E-Mail-Adresse" 
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                  />
                  <Button 
                    onClick={handleAddParticipant}
                    disabled={addParticipantMutation.isPending || !newParticipantEmail.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Hinzufügen
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Aktuelle Teilnehmer</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {challenge.participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{participant.name}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                        onClick={() => removeParticipantMutation.mutate(participant.id)}
                        disabled={removeParticipantMutation.isPending || participant.id === session?.user?.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsManageParticipantsOpen(false)}>
                Schließen
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add Proof Dialog */}
        <Dialog open={isAddProofOpen} onOpenChange={setIsAddProofOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Fortschritt hinzufügen</DialogTitle>
              <DialogDescription>
                Teile deinen Fortschritt mit einem Beweisfoto.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="progress-value">Fortschritt in {challenge.target.unit}</Label>
                <Input 
                  id="progress-value" 
                  type="number" 
                  min="0.1"
                  step="0.1"
                  placeholder={`z.B. 5 ${challenge.target.unit}`}
                  value={progressValue || ''}
                  onChange={(e) => setProgressValue(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Beweisfoto</Label>
                {imagePreview ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-md">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="object-cover w-full h-full" 
                    />
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="absolute top-2 right-2 opacity-80"
                      onClick={() => {
                        setProofImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border-2 border-dashed border-gray-300">
                    <label className="cursor-pointer flex flex-col items-center">
                      <Camera className="h-8 w-8 mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500">Foto auswählen</span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddProofOpen(false)}
              >
                Abbrechen
              </Button>
              <Button 
                onClick={handleAddProof}
                disabled={!proofImage || progressValue <= 0 || addProofMutation.isPending}
              >
                {addProofMutation.isPending ? "Wird hochgeladen..." : "Fortschritt hinzufügen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Proof Confirmation Dialog */}
        <AlertDialog open={isDeleteProofDialogOpen} onOpenChange={setIsDeleteProofDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Beweis löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchtest du diesen Beweis wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                Der Fortschritt von {proofToDelete?.progress_value} {challenge.target.unit} wird von deiner Gesamtleistung abgezogen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProof}
                className="bg-red-600 hover:bg-red-700"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};
