import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Calendar, Home, User, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Du wurdest erfolgreich abgemeldet.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Abmelden",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-4 w-full">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">HabitFlow</span>
          </Link>
          
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
          </Link>
          
          <Link to="/calendar">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Calendar className="h-5 w-5 mr-2" />
              Kalender
            </Button>
          </Link>
          
          <Link to="/education">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <BookOpen className="h-5 w-5 mr-2" />
              Education
            </Button>
          </Link>
          
          <Link to="/toolbox">
            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
              <Package className="h-5 w-5 mr-2" />
              Toolbox
            </Button>
          </Link>
          
          <div className="ml-auto flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                <User className="h-5 w-5 mr-2" />
                Profil
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-destructive/10">
              <LogOut className="h-5 w-5 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};