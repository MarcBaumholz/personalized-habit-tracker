
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
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <LayoutDashboard className="h-5 w-5 mr-2" />
          Dashboard
        </Button>
      </Link>
      
      <Link to="/profile">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <User className="h-5 w-5 mr-2" />
          Profil
        </Button>
      </Link>
      
      <Link to="/calendar">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Calendar className="h-5 w-5 mr-2" />
          Kalender
        </Button>
      </Link>
      
      <Link to="/education">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <BookOpen className="h-5 w-5 mr-2" />
          Education
        </Button>
      </Link>
      
      <Link to="/toolbox">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Package className="h-5 w-5 mr-2" />
          Toolbox
        </Button>
      </Link>
      
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start">
        <LogOut className="h-5 w-5 mr-2" />
        Abmelden
      </Button>
    </>
  );

  return (
    <nav className="bg-white border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="mr-6">
            <span className="text-xl font-bold">HabitJourney</span>
          </Link>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[340px]">
                <div className="py-4 flex flex-col gap-2">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center space-x-4">
              <NavItems />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
