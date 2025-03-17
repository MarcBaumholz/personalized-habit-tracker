
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { User, Check } from "lucide-react";

interface UsernameEditorProps {
  profileId: string;
  currentUsername: string | null;
}

export const UsernameEditor = ({ profileId, currentUsername }: UsernameEditorProps) => {
  const [username, setUsername] = useState(currentUsername || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast({
        title: "Benutzername erforderlich",
        description: "Bitte gib einen Benutzernamen ein.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ username })
        .eq('id', profileId);
      
      if (error) throw error;
      
      toast({
        title: "Benutzername aktualisiert",
        description: "Dein Benutzername wurde erfolgreich aktualisiert.",
      });
      
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Fehler bei der Aktualisierung",
        description: "Dein Benutzername konnte nicht aktualisiert werden. Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-gray-600">@{username || "username"}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
          className="h-8 px-2"
        >
          <User className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="username" className="text-xs text-gray-600">Benutzername</Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-gray-500">@</span>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="pl-7"
            placeholder="Benutzername"
          />
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          size="sm"
          className="h-10"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
