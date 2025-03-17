
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileImageUploadProps {
  profileId: string;
  currentImage?: string | null;
  fullName?: string | null;
}

export const ProfileImageUpload = ({ profileId, currentImage, fullName }: ProfileImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a preview
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);

    try {
      setIsUploading(true);
      
      // Upload to Supabase Storage
      const fileName = `${profileId}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
      
      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', profileId);
      
      if (updateError) throw updateError;
      
      // Success notification and invalidate queries
      toast({
        title: "Profilbild aktualisiert",
        description: "Dein neues Profilbild wurde erfolgreich hochgeladen.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Dein Profilbild konnte nicht hochgeladen werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32 border-4 border-blue-100 relative group">
        <AvatarImage 
          src={previewUrl || currentImage || ""} 
          alt={fullName || "User"} 
        />
        <AvatarFallback className="bg-blue-600 text-white text-2xl">
          {getInitials(fullName)}
        </AvatarFallback>
        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
          </label>
        </div>
      </Avatar>
      
      <Input 
        type="file" 
        id="avatar-upload" 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      <label htmlFor="avatar-upload">
        <Button 
          variant="outline" 
          className="cursor-pointer" 
          disabled={isUploading}
          asChild
        >
          <span>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Wird hochgeladen..." : "Profilbild ändern"}
          </span>
        </Button>
      </label>
    </div>
  );
};
