
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileImageUploadProps {
  profileId: string;
  currentImage: string | null;
  fullName: string | null;
}

export const ProfileImageUpload = ({ 
  profileId, 
  currentImage, 
  fullName 
}: ProfileImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${profileId}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update the user's profile with the new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", profileId);

      if (updateError) throw updateError;

      // Invalidate queries to refresh profile data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      toast({
        title: "Profilbild aktualisiert",
        description: "Dein Profilbild wurde erfolgreich aktualisiert.",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Fehler beim Hochladen",
        description: "Dein Profilbild konnte nicht hochgeladen werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setShowUploadButton(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentImage) return;

    try {
      setIsUploading(true);

      // Extract the file path from the URL
      const url = new URL(currentImage);
      const pathWithoutBucket = url.pathname.split("/").slice(2).join("/");

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from("avatars")
        .remove([pathWithoutBucket]);

      if (deleteError) throw deleteError;

      // Update the profile to remove the avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profileId);

      if (updateError) throw updateError;

      // Invalidate queries to refresh profile data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });

      toast({
        title: "Profilbild entfernt",
        description: "Dein Profilbild wurde erfolgreich entfernt.",
      });
    } catch (error) {
      console.error("Error removing avatar:", error);
      toast({
        title: "Fehler beim Entfernen",
        description: "Dein Profilbild konnte nicht entfernt werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setShowUploadButton(false);
    }
  };

  return (
    <div 
      className="relative group" 
      onMouseEnter={() => setShowUploadButton(true)}
      onMouseLeave={() => setShowUploadButton(false)}
    >
      <Avatar className="h-32 w-32 border-4 border-blue-100">
        <AvatarImage src={currentImage || ""} />
        <AvatarFallback className="bg-blue-600 text-white text-2xl">
          {getInitials(fullName)}
        </AvatarFallback>
      </Avatar>

      {showUploadButton && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
          <div className="flex flex-col gap-2">
            <label htmlFor="avatar-upload" className="cursor-pointer">
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-9 w-9 p-0" 
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </label>

            {currentImage && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-9 w-9 p-0" 
                onClick={handleRemoveAvatar}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};
