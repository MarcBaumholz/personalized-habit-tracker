import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div 
            className="text-xl font-bold text-primary cursor-pointer" 
            onClick={() => navigate("/")}
          >
            HabitJourney
          </div>
          <div className="space-x-4">
            <Button 
              variant={isActive("/dashboard") ? "default" : "ghost"} 
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <Button 
              variant={isActive("/profile") ? "default" : "ghost"} 
              onClick={() => navigate("/profile")}
            >
              Profil
            </Button>
            <Button 
              variant={isActive("/calendar") ? "default" : "ghost"} 
              onClick={() => navigate("/calendar")}
            >
              Kalender
            </Button>
            <Button 
              variant={isActive("/education") ? "default" : "ghost"} 
              onClick={() => navigate("/education")}
            >
              Education
            </Button>
            <Button 
              variant={isActive("/toolbox") ? "default" : "ghost"} 
              onClick={() => navigate("/toolbox")}
            >
              Toolbox
            </Button>
            <Button 
              variant={isActive("/community") ? "default" : "ghost"} 
              onClick={() => navigate("/community")}
            >
              Community
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};