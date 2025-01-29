import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Calendar, Home, User, BookOpen } from "lucide-react";

export const Navigation = () => {
  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="ghost" size="sm">
              <Calendar className="h-5 w-5 mr-2" />
              Kalender
            </Button>
          </Link>
          <Link to="/education">
            <Button variant="ghost" size="sm">
              <BookOpen className="h-5 w-5 mr-2" />
              Education
            </Button>
          </Link>
          <Link to="/toolbox">
            <Button variant="ghost" size="sm">
              <Package className="h-5 w-5 mr-2" />
              Toolbox
            </Button>
          </Link>
          <div className="ml-auto">
            <Link to="/profile">
              <Button variant="ghost" size="sm">
                <User className="h-5 w-5 mr-2" />
                Profil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};