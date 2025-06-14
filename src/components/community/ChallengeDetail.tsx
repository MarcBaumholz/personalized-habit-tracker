import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlus, AlertTriangle } from "lucide-react";
import { ChallengeHeader } from "./challenge-detail/ChallengeHeader";
import { ChallengeProgressSection } from "./challenge-detail/ChallengeProgressSection";
import { ChallengeProofs } from "./challenge-detail/ChallengeProofs";
import { ParticipantsList } from "./challenge-detail/ParticipantsList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Simple type definitions
interface UserProfile {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

interface ProofItem {
  id: string;
  user_id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  progress_value: number;
  profiles?: UserProfile | null;
}

interface ParticipantItem {
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
  targetValue: number;
  targetUnit: string;
  endDate: string;
  currentProgress: number;
  participants: ParticipantItem[];
  created_by?: string;
}

export const ChallengeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageParticipantsOpen, setIsManageParticipantsOpen] = useState(false);
  const [isAddProofOpen, setIsAddProofOpen] = useState(false);
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [groupedProofs, setGroupedProofs] = useState<Record<string, ProofItem[]>>({});
  const [totalProgress, setTotalProgress] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDeleteProofDialogOpen, setIsDeleteProofDialogOpen] = useState(false);
  const [proofToDelete, setProofToDelete] = useState<ProofItem | null>(null);
  const [realChallenge, setRealChallenge] = useState<ChallengeInfo | null>(null);
  
  // Get current user
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = session?.user;

  // Fetch challenge data
  const { data: challengeData, isLoading: isLoadingChallenge } = useQuery({
    queryKey: ["challenge", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("community_challenges")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        console.error("Error fetching challenge:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!id,
  });

  // Fetch participants
  const { data: participantsData, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ["challenge-participants", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("challenge_participants")
        .select(`
          id,
          user_id,
          progress,
          profiles (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq("challenge_id", id);
      
      if (error) {
        console.error("Error fetching participants:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!id,
  });

  // Fetch proofs
  const { data: proofsData, isLoading: isLoadingProofs } = useQuery({
    queryKey: ["challenge-proofs", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("challenge_proofs")
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq("challenge_id", id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching proofs:", error);
        return [];
      }
      
      return data;
    },
    enabled: !!id,
  });

  // Process participants data
  useEffect(() => {
    if (participantsData) {
      const processedParticipants = participantsData.map((p: any) => ({
        id: p.user_id,
        name: p.profiles?.full_name || p.profiles?.username || "Anonym",
        avatar: p.profiles?.avatar_url || "",
        progress: p.progress || 0,
      }));
      
      setParticipants(processedParticipants);
    }
  }, [participantsData]);

  // Process proofs data
  useEffect(() => {
    if (proofsData) {
      // Group proofs by date
      const grouped = proofsData.reduce((acc: Record<string, ProofItem[]>, proof: any) => {
        const date = new Date(proof.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(proof);
        return acc;
      }, {});
      
      setGroupedProofs(grouped);
      
      // Calculate total progress
      const total = proofsData.reduce((sum: number, proof: any) => sum + (proof.progress_value || 0), 0);
      setTotalProgress(total);
    }
  }, [proofsData]);

  // Process challenge data
  useEffect(() => {
    if (challengeData) {
      setRealChallenge({
        id: challengeData.id,
        title: challengeData.title,
        description: challengeData.description || "",
        category: challengeData.category || "Allgemein",
        targetValue: challengeData.target_value,
        targetUnit: challengeData.target_unit,
        endDate: challengeData.end_date,
        currentProgress: totalProgress,
        participants: participants,
        created_by: challengeData.created_by,
      });
    }
  }, [challengeData, participants, totalProgress]);

  // Default challenge data if none exists in database
  const challenge: ChallengeInfo = realChallenge || {
    id: id || '',
    title: id === '1' ? '100 km Laufen' : id === '3' ? '1000 Seiten lesen' : 'Challenge',
    description: id === '1' ? 
      'Gemeinsam laufen wir 100 km in diesem Monat. Jeder Schritt zählt!' :
      id === '3' ? 
      'Lesen wir zusammen 1000 Seiten in diesem Monat. Bildung ist der Schlüssel!' :
      'Eine Herausforderung für alle!',
    category: id === '1' ? 'Fitness' : id === '3' ? 'Bildung' : 'Allgemein',
    targetValue: id === '1' ? 100 : id === '3' ? 1000 : 100,
    targetUnit: id === '1' ? 'km' : id === '3' ? 'Seiten' : 'Einheiten',
    endDate: '2024-12-31',
    currentProgress: totalProgress,
    participants: participants,
    created_by: user?.id
  };

  // Add proof mutation
  const addProofMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id || !proofImage || progressValue <= 0) {
        throw new Error("Missing required data");
      }
      
      // Upload image
      const fileExt = proofImage.name.split('.').pop();
      const fileName = `${id}/${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('challenge-proofs')
        .upload(fileName, proofImage);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('challenge-proofs')
        .getPublicUrl(fileName);
      
      // Add proof record
      const { error: insertError } = await supabase
        .from('challenge_proofs')
        .insert({
          challenge_id: id,
          user_id: user.id,
          image_url: publicUrl,
          progress_value: progressValue,
        });
      
      if (insertError) {
        throw insertError;
      }
      
      // Update participant progress
      await supabase.rpc('increment_participant_progress', {
        p_user_id: user.id,
        p_challenge_id: id,
        p_progress_value: progressValue,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-proofs", id] });
      queryClient.invalidateQueries({ queryKey: ["challenge-participants", id] });
      setIsAddProofOpen(false);
      setProofImage(null);
      setImagePreview(null);
      setProgressValue(0);
      toast({
        title: "Beweis hinzugefügt",
        description: "Dein Fortschritt wurde erfolgreich aktualisiert.",
      });
    },
    onError: (error) => {
      console.error("Error adding proof:", error);
      toast({
        title: "Fehler",
        description: "Beweis konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    },
  });

  // Delete proof mutation
  const deleteProofMutation = useMutation({
    mutationFn: async (proof: ProofItem) => {
      if (!user || !proof) {
        throw new Error("Missing required data");
      }
      
      // Delete proof record
      const { error: deleteError } = await supabase
        .from('challenge_proofs')
        .delete()
        .eq('id', proof.id)
        .eq('user_id', user.id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Update participant progress (decrement)
      await supabase.rpc('increment_participant_progress', {
        p_user_id: user.id,
        p_challenge_id: proof.challenge_id,
        p_progress_value: -proof.progress_value,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-proofs", id] });
      queryClient.invalidateQueries({ queryKey: ["challenge-participants", id] });
      setIsDeleteProofDialogOpen(false);
      setProofToDelete(null);
      toast({
        title: "Beweis gelöscht",
        description: "Dein Fortschritt wurde aktualisiert.",
      });
    },
    onError: (error) => {
      console.error("Error deleting proof:", error);
      toast({
        title: "Fehler",
        description: "Beweis konnte nicht gelöscht werden.",
        variant: "destructive",
      });
    },
  });

  // Add participant mutation
  const addParticipantMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!id || !email) {
        throw new Error("Missing required data");
      }
      
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        throw new Error("Benutzer nicht gefunden");
      }
      
      // Add participant
      const { error: insertError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: id,
          user_id: userData.id,
          progress: 0,
        });
      
      if (insertError) {
        throw insertError;
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-participants", id] });
      setNewParticipantEmail("");
      toast({
        title: "Teilnehmer hinzugefügt",
        description: "Der Benutzer wurde zur Challenge hinzugefügt.",
      });
    },
    onError: (error) => {
      console.error("Error adding participant:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Teilnehmer konnte nicht hinzugefügt werden.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProof = () => {
    addProofMutation.mutate();
  };

  const handleAddParticipant = () => {
    if (newParticipantEmail) {
      addParticipantMutation.mutate(newParticipantEmail);
    }
  };

  const handleDeleteProof = (proof: ProofItem) => {
    if (user?.id !== proof.user_id) {
      toast({
        title: "Nicht erlaubt",
        description: "Du kannst nur deine eigenen Beweise löschen.",
        variant: "destructive",
      });
      return;
    }
    setProofToDelete(proof);
    setIsDeleteProofDialogOpen(true);
  };

  const confirmDeleteProof = () => {
    if (proofToDelete) {
      deleteProofMutation.mutate(proofToDelete);
    }
  };

  const isParticipant = participants.some(p => p.id === user?.id);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <ChallengeHeader
        title={challenge.title}
        category={challenge.category}
        description={challenge.description}
        target={{ value: challenge.targetValue, unit: challenge.targetUnit }}
        endDate={challenge.endDate}
        participantsCount={challenge.participants.length}
        canEdit={user?.id === challenge.created_by}
        onEditClick={() => setIsEditDialogOpen(true)}
      />

      <ChallengeProgressSection
        currentProgress={challenge.currentProgress}
        targetValue={challenge.targetValue}
        targetUnit={challenge.targetUnit}
      />

      <Tabs defaultValue="proofs" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="proofs">Beweise</TabsTrigger>
          <TabsTrigger value="participants">Teilnehmer</TabsTrigger>
        </TabsList>

        <TabsContent value="proofs" className="space-y-4">
          <ChallengeProofs
            groupedProofs={groupedProofs}
            targetUnit={challenge.targetUnit}
            currentUserId={user?.id}
            isParticipating={isParticipant}
            onAddProofClick={() => setIsAddProofOpen(true)}
            onDeleteProof={handleDeleteProof}
          />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Teilnehmer</h3>
              {user?.id === challenge.created_by && (
                <Button onClick={() => setIsManageParticipantsOpen(true)} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Teilnehmer verwalten
                </Button>
              )}
            </div>
            <ParticipantsList
              participants={challenge.participants}
              targetValue={challenge.targetValue}
              targetUnit={challenge.targetUnit}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Proof Dialog */}
      <Dialog open={isAddProofOpen} onOpenChange={setIsAddProofOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fortschritt hinzufügen</DialogTitle>
            <DialogDescription>
              Lade ein Bild hoch und gib deinen Fortschritt an.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof-image">Beweis-Bild</Label>
              <div className="flex items-center gap-4">
                <Input 
                  id="proof-image" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Vorschau" 
                    className="max-h-40 rounded-md" 
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="progress-value">
                Fortschritt ({challenge.targetUnit})
              </Label>
              <Input 
                id="progress-value" 
                type="number" 
                min="0.1" 
                step="0.1" 
                value={progressValue || ''} 
                onChange={(e) => setProgressValue(parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProofOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleAddProof} 
              disabled={!proofImage || progressValue <= 0}
            >
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Participants Dialog */}
      <Dialog open={isManageParticipantsOpen} onOpenChange={setIsManageParticipantsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teilnehmer verwalten</DialogTitle>
            <DialogDescription>
              Füge neue Teilnehmer zur Challenge hinzu.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participant-email">E-Mail des Teilnehmers</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="participant-email" 
                  type="email" 
                  placeholder="email@beispiel.de" 
                  value={newParticipantEmail} 
                  onChange={(e) => setNewParticipantEmail(e.target.value)} 
                />
                <Button onClick={handleAddParticipant} disabled={!newParticipantEmail}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Aktuelle Teilnehmer</h3>
              <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                {participants.length > 0 ? (
                  <ul className="space-y-2">
                    {participants.map((participant) => (
                      <li key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>
                              {participant.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{participant.name}</span>
                        </div>
                        <Badge variant="outline">
                          {participant.progress} {challenge.targetUnit}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Noch keine Teilnehmer
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Proof Confirmation Dialog */}
      <Dialog open={isDeleteProofDialogOpen} onOpenChange={setIsDeleteProofDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beweis löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du diesen Beweis löschen möchtest? 
              Dein Fortschritt wird entsprechend angepasst.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteProofDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteProof}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
