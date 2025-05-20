
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface ProofItem {
  id: string;
  user_id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  progress_value: number;
  user_name?: string;
  user_avatar?: string;
}

interface ProofCircleProps {
  challengeId: string;
  proofs?: ProofItem[];
}

export const ProofCircle = ({ challengeId, proofs = [] }: ProofCircleProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedImage(file);
    
    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  };

  const uploadProofMutation = useMutation({
    mutationFn: async ({ file, progress }: { file: File, progress: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Upload image to Supabase Storage
      const fileName = `${user.id}_${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('challenge-proofs')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('challenge-proofs')
        .getPublicUrl(fileName);
      
      // Add proof record to database
      const { data: proofData, error: proofError } = await supabase
        .from('challenge_proofs')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          image_url: publicUrl,
          progress_value: progress
        })
        .select();
        
      if (proofError) throw proofError;
      
      // Update user's progress in challenge_participants
      const { data: participantData, error: participantError } = await supabase
        .from('challenge_participants')
        .select('progress')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();
      
      if (!participantError) {
        const currentProgress = participantData?.progress || 0;
        const newProgress = currentProgress + progress;
        
        await supabase
          .from('challenge_participants')
          .update({ progress: newProgress })
          .eq('user_id', user.id)
          .eq('challenge_id', challengeId);
      }
      
      return proofData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenge-proofs', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['user-participations'] });
      setIsUploadOpen(false);
      setSelectedImage(null);
      setPreviewUrl(null);
      setProgressValue(0);
      toast({
        title: "Beweis hochgeladen",
        description: "Dein Fortschritt wurde erfolgreich dokumentiert.",
      });
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Bitte versuche es später erneut.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || progressValue <= 0) {
      toast({
        title: "Unvollständige Eingabe",
        description: "Bitte wähle ein Bild und gib einen Fortschritt an.",
        variant: "destructive"
      });
      return;
    }
    
    uploadProofMutation.mutate({ 
      file: selectedImage, 
      progress: progressValue 
    });
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Beweise & Fortschritt</h3>
        <Button onClick={() => setIsUploadOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Fortschritt hinzufügen
        </Button>
      </div>
      
      {/* Proof Circle */}
      <div className="flex flex-wrap gap-3 items-center justify-center my-6">
        {proofs.length > 0 ? (
          proofs.map((proof, index) => (
            <div key={proof.id} className="relative">
              <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                <AvatarImage src={proof.image_url} alt="Beweis" />
                <AvatarFallback>{proof.user_name?.[0] || "P"}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                +{proof.progress_value}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 w-full text-gray-500">
            <p>Noch keine Beweise vorhanden.</p>
            <p className="text-sm">Sei der Erste, der seinen Fortschritt dokumentiert!</p>
          </div>
        )}
      </div>
      
      {/* Upload Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fortschritt dokumentieren</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proof-image">Beweisfoto</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center relative">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Vorschau" 
                      className="mx-auto max-h-48 rounded" 
                    />
                    <button 
                      type="button" 
                      className="absolute top-0 right-0 bg-red-500 rounded-full p-1 text-white"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Klicke hier oder ziehe ein Foto hierher</p>
                  </>
                )}
                <Input
                  id="proof-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="progress-value">Fortschritt</Label>
              <div className="flex items-center gap-2">
                <Input 
                  id="progress-value"
                  type="number" 
                  value={progressValue}
                  onChange={(e) => setProgressValue(Number(e.target.value))}
                  min="0"
                  step="0.1"
                  placeholder="z.B. 5 km oder 30 Seiten"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsUploadOpen(false)}
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                disabled={!selectedImage || progressValue <= 0 || uploadProofMutation.isPending}
              >
                {uploadProofMutation.isPending ? "Wird hochgeladen..." : "Hochladen"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
