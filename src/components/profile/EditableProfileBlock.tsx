
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditableProfileBlockProps {
  title: string;
  content: string;
  sectionKey: string;
  className?: string;
  onUpdate?: () => void;
}

export const EditableProfileBlock = ({ 
  title, 
  content, 
  sectionKey,
  className = "",
  onUpdate
}: EditableProfileBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [displayContent, setDisplayContent] = useState(content);
  const { toast } = useToast();

  // Update local state when content prop changes
  useEffect(() => {
    setEditedContent(content);
    setDisplayContent(content);
  }, [content]);

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // First check if we need to save to onboarding_responses
      if (sectionKey === "motivation" || sectionKey === "challenges" || 
          sectionKey === "curiosities" || sectionKey === "values" || 
          sectionKey === "current_habits") {
        
        // Check if response already exists
        const { data: existingResponse, error: checkError } = await supabase
          .from('onboarding_responses')
          .select('*')
          .eq('user_id', user.id)
          .eq('question_key', sectionKey)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingResponse) {
          // Update existing response
          const { error } = await supabase
            .from('onboarding_responses')
            .update({ response: editedContent })
            .eq('user_id', user.id)
            .eq('question_key', sectionKey);
          
          if (error) throw error;
        } else {
          // Insert new response
          const { error } = await supabase
            .from('onboarding_responses')
            .insert({
              user_id: user.id,
              question_key: sectionKey,
              response: editedContent
            });
          
          if (error) throw error;
        }
      }

      // Always save to profile_sections as well (for future-proofing)
      const { error } = await supabase
        .from('profile_sections')
        .upsert({
          user_id: user.id,
          section_key: sectionKey,
          content: { text: editedContent },
        }, {
          onConflict: 'user_id,section_key'
        });

      if (error) throw error;

      // Update the displayed content
      setDisplayContent(editedContent);
      
      toast({
        title: "Gespeichert",
        description: "Deine Änderungen wurden erfolgreich gespeichert.",
      });

      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Fehler",
        description: "Deine Änderungen konnten nicht gespeichert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`p-6 bg-white rounded-2xl shadow-lg border border-blue-100 backdrop-blur-sm transition-all duration-300 hover:shadow-xl animate-slide-in ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-blue-700">{title}</h3>
        {!isEditing ? (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditing(true)}
            className="hover:bg-blue-50"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSave}
              className="hover:bg-green-50 text-green-600"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(displayContent); // Reset to current display content
              }}
              className="hover:bg-red-50 text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[100px] border-blue-200 focus:border-blue-400"
        />
      ) : (
        <p className="text-blue-600">{displayContent}</p>
      )}
    </Card>
  );
};
