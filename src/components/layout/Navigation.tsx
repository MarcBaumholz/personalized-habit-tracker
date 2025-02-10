
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Calendar, Home, User, BookOpen, LogOut, LayoutDashboard, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const NavItems = () => (
    <>
      <Link to="/dashboard">
        <Button variant="ghost" size="lg" className="w-full justify-start text-blue-700 hover:text-blue-800 hover:bg-blue-50">
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Dashboard
        </Button>
      </Link>
      
      <Link to="/profile">
        <Button variant="ghost" size="lg" className="w-full justify-start text-blue-700 hover:text-blue-800 hover:bg-blue-50">
          <User className="h-5 w-5 mr-3" />
          Profil
        </Button>
      </Link>
      
      <Link to="/calendar">
        <Button variant="ghost" size="lg" className="w-full justify-start text-blue-700 hover:text-blue-800 hover:bg-blue-50">
          <Calendar className="h-5 w-5 mr-3" />
          Kalender
        </Button>
      </Link>
      
      <Link to="/education">
        <Button variant="ghost" size="lg" className="w-full justify-start text-blue-700 hover:text-blue-800 hover:bg-blue-50">
          <BookOpen className="h-5 w-5 mr-3" />
          Education
        </Button>
      </Link>
      
      <Link to="/toolbox">
        <Button variant="ghost" size="lg" className="w-full justify-start text-blue-700 hover:text-blue-800 hover:bg-blue-50">
          <Package className="h-5 w-5 mr-3" />
          Toolbox
        </Button>
      </Link>
      
      <Button 
        variant="ghost" 
        size="lg" 
        onClick={handleSignOut} 
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <LogOut className="h-5 w-5 mr-3" />
        Abmelden
      </Button>
    </>
  );

  return (
    <nav className="bg-white border-b border-blue-100 shadow-sm">
      <div className="container flex h-20 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="mr-6">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              HabitJourney
            </span>
          </Link>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-blue-700">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[340px] bg-white">
                <div className="py-6 flex flex-col gap-2">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-6">
              <NavItems />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
