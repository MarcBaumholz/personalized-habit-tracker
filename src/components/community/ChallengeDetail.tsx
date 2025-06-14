import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Camera, Plus, Trash2 } from "lucide-react";
import { ChallengeHeader } from "./challenge-detail/ChallengeHeader";
import { ChallengeProgressSection } from "./challenge-detail/ChallengeProgressSection";
import { ParticipantsList } from "./challenge-detail/ParticipantsList";
import { ChallengeProofs } from "./challenge-detail/ChallengeProofs";
import { ChallengeActionButtons } from "./challenge-detail/ChallengeActionButtons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Simple interfaces without circular dependencies
interface ProfileData {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

interface ProofData {
  id: string;
  user_id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  progress_value: number;
  profiles?: ProfileData | null;
}

interface ParticipantData {
  id: string;
  name: string;
  avatar: string;
  progress: number;
}

interface ChallengeInfo {
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
  participants: ParticipantData[];
  created_by?: string;
}

interface ProofsByDate {
  [date: string]: ProofData[];
}

// New interface for challenge_participants table row
interface ChallengeParticipantDbRow {
  id: string; // uuid
  user_id: string; // uuid
  challenge_id: string; // text
  progress: number | null;
  created_at: string | null; // timestamptz, ISO string
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
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [groupedProofs, setGroupedProofs] = useState<ProofsByDate>({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeleteProofDialogOpen, setIsDeleteProofDialogOpen] = useState(false);
  const [proofToDelete, setProofToDelete] = useState<ProofData | null>(null);
  const [realChallenge, setRealChallenge] = useState<ChallengeInfo | null>(null);
  
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
      return Promise.all(
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
      return Promise.all(
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
            profiles: profileData || null
          } as ProofData;
        })
      );
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
      }, {} as ProofsByDate);
      
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
        created_by: challengeData.created_by,
        currentProgress: totalProgress,
        participants: participants
      });
    }
  }, [challengeData, totalProgress, participants]);
  
  // Default challenge data if none exists in database
  const challenge: ChallengeInfo = realChallenge || {
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
  
  // Join challenge mutation
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
  
  // Leave challenge mutation
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
  
  // Remove participant mutation
  const removeParticipantMutation = useMutation<
    void,    // TData
    Error,   // TError
    string   // TVariables (participantId)
  >({
    mutationFn: async (participantId: string): Promise<void> => {
      if (!id) {
        throw new Error("Challenge ID is missing. Cannot remove participant.");
      }
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('user_id', participantId)
        .eq('challenge_id', id); // Use guarded id
        
      if (error) throw error;
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
  
  // Add participant mutation
  const addParticipantMutation = useMutation<
    ChallengeParticipantDbRow[] | null, // TData
    Error,                              // TError
    string                              // TVariables (email)
  >({
    mutationFn: async (email: string): Promise<ChallengeParticipantDbRow[] | null> => {
      if (!id) {
        throw new Error("Challenge ID is missing. Cannot add participant.");
      }
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
          challenge_id: id, // Use guarded id
          progress: 0
        })
        .select(); // Add .select()
        
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
    onError: (error) => { // error is type Error from TError
      console.error("Add participant error:", error);
      toast({
        title: "Fehler beim Hinzufügen",
        description: error.message || "Bitte versuche es später erneut.",
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
      const { data: participantData, error: updateError } = await supabase.rpc(
        'increment_participant_progress',
        {
          p_user_id: session.user.id,
          p_challenge_id: id!,
          p_progress_value: progressValue
        }
      );
        
      if (updateError) throw updateError;
      
      // Update the participant record with the new progress
      const { error: participantUpdateError } = await supabase
        .from('challenge_participants')
        .update({ progress: participantData })
        .eq('user_id', session.user.id)
        .eq('challenge_id', id!);
      
      if (participantUpdateError) throw participantUpdateError;
      
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
  
  const handleDeleteProof = (proof: ProofData) => {
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
  
  const canEdit = user && (challengeData?.created_by === user.id);
  
  const handleChallengeUpdated = (challengeId: string) => {
    queryClient.invalidateQueries({ queryKey: ['challenge-data', id] });
    toast({
      title: "Challenge aktualisiert",
      description: "Die Challenge wurde erfolgreich aktualisiert.",
    });
  };
  
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
  
  if (!challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container max-w-7xl mx-auto py-6 px-4">
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-2">Challenge nicht gefunden</h2>
            <p className="text-gray-600">Die angeforderte Challenge existiert nicht oder du hast keinen Zugriff.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-6">
        <ChallengeHeader
          title={challenge.title}
          category={challenge.category}
          description={challenge.description}
          target={challenge.target}
          endDate={challenge.endDate}
          participantsCount={challenge.participants.length}
          canEdit={canEdit}
          onEditClick={() => setIsEditOpen(true)}
        />
        
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              {/* Challenge Info */}
              <div className="flex-1">
                <ChallengeProgressSection
                  currentProgress={challenge.currentProgress}
                  targetValue={challenge.target.value}
                  targetUnit={challenge.target.unit}
                />
                
                <ChallengeActionButtons
                  isParticipating={!!participation}
                  isJoinPending={joinChallengeMutation.isPending}
                  isLeavePending={leaveChallengeMutation.isPending}
                  onJoinLeave={handleJoinLeave}
                  onAddProof={() => setIsAddProofOpen(true)}
                  onManageParticipants={() => setIsManageParticipantsOpen(true)}
                />
              </div>
              
              {/* Participants */}
              {/* Pass as ParticipantData[] (no recursive/circular) */}
              <ParticipantsList
                participants={challenge.participants as Array<{ id: string; name: string; avatar: string; progress: number }>}
                targetValue={challenge.target.value}
                targetUnit={challenge.target.unit}
              />
            </div>
            
            {/* Challenge Proofs */}
            <ChallengeProofs
              groupedProofs={groupedProofs}
              targetUnit={challenge.target.unit}
              currentUserId={user?.id}
              isParticipating={!!participation}
              onAddProofClick={() => setIsAddProofOpen(true)}
              onDeleteProof={handleDeleteProof}
            />
            
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
          onChallengeUpdated={handleChallengeUpdated}
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
                          <AvatarImage src={participant.avatar} alt="" />
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
