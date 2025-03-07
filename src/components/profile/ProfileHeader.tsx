
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, UserPlus, UserCheck, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Profile {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  username: string | null;
}

interface ProfileHeaderProps {
  profile: Profile | null | undefined;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onRestartOnboarding: () => void;
}

export const ProfileHeader = ({ 
  profile, 
  isFollowing, 
  onFollowToggle, 
  onRestartOnboarding 
}: ProfileHeaderProps) => {
  
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card className="p-6 bg-white rounded-2xl shadow-sm border border-blue-100">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex-shrink-0">
          <Avatar className="h-32 w-32 border-4 border-blue-100">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
            <AvatarFallback className="bg-blue-600 text-white text-2xl">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-800 mb-1">
            {profile?.full_name || "Dein Profil"}
          </h1>
          <p className="text-blue-600 text-lg">
            @{profile?.username || "username"}
          </p>
          <p className="mt-4 text-gray-600 max-w-2xl">
            Willkommen auf deinem persönlichen Profil! Hier kannst du deine Persönlichkeitsmerkmale, 
            Gewohnheiten und Lebensbereiche einsehen und bearbeiten.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button 
              onClick={onFollowToggle} 
              variant={isFollowing ? "outline" : "default"}
              className="gap-2 w-full md:w-auto"
            >
              {isFollowing ? (
                <>
                  <UserCheck className="h-4 w-4" />
                  Folgst du
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Folgen
                </>
              )}
            </Button>
            
            <Button variant="outline" className="gap-2 w-full md:w-auto">
              <Mail className="h-4 w-4" />
              Nachricht
            </Button>
          </div>
          
          <Button onClick={onRestartOnboarding} variant="ghost" className="hover:bg-blue-50 gap-2">
            <RefreshCw className="h-4 w-4" />
            Onboarding neu starten
          </Button>
        </div>
      </div>
    </Card>
  );
};
