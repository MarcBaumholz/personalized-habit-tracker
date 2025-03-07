
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, Package, LogOut, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path: string) => location.pathname === path;

  const NavItems = () => (
    <div className={cn("flex", isMobile ? "flex-col space-y-2" : "items-center space-x-2")}>
      <Link to="/dashboard">
        <Button
          variant="ghost"
          size={isMobile ? "lg" : "sm"}
          className={cn(
            "font-medium",
            isActive("/dashboard") 
              ? "bg-blue-50 text-blue-700" 
              : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
          )}
        >
          <LayoutDashboard className={cn("h-5 w-5", isMobile ? "mr-3" : "mr-2")} />
          {isMobile ? "Dashboard" : "Dashboard"}
        </Button>
      </Link>
      
      <Link to="/calendar">
        <Button
          variant="ghost"
          size={isMobile ? "lg" : "sm"}
          className={cn(
            "font-medium",
            isActive("/calendar") 
              ? "bg-blue-50 text-blue-700" 
              : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
          )}
        >
          <Calendar className={cn("h-5 w-5", isMobile ? "mr-3" : "mr-2")} />
          {isMobile ? "Kalender" : "Kalender"}
        </Button>
      </Link>
      
      <Link to="/toolbox">
        <Button
          variant="ghost"
          size={isMobile ? "lg" : "sm"}
          className={cn(
            "font-medium",
            isActive("/toolbox") 
              ? "bg-blue-50 text-blue-700" 
              : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"
          )}
        >
          <Package className={cn("h-5 w-5", isMobile ? "mr-3" : "mr-2")} />
          {isMobile ? "Toolbox" : "Toolbox"}
        </Button>
      </Link>
    </div>
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container flex h-16 items-center px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Link to="/" className="mr-2">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
                HabitJourney
              </span>
            </Link>
            
            {!isMobile && <NavItems />}
          </div>
          
          <div className="flex items-center space-x-2">
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-blue-700 hover:bg-blue-50">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut} 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>

            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="ml-2">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                      <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="pt-10">
                  <NavItems />
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
