
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

export const CalendarSync: React.FC = () => {
  const { toast } = useToast();

  const handleGoogleSync = () => {
    toast({
      title: "Google Kalender",
      description: "Die Synchronisierung mit Google Kalender wird vorbereitet...",
    });
    // Implementation would connect to Google Calendar API
  };

  const handleAppleSync = () => {
    toast({
      title: "Apple Kalender",
      description: "Die Synchronisierung mit Apple Kalender wird vorbereitet...",
    });
    // Implementation would connect to Apple Calendar API
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <CalendarClock className="h-4 w-4" />
          <span className="hidden sm:inline">Kalender Sync</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Kalender Synchronisation</h4>
            <p className="text-xs text-muted-foreground">
              Verbinde mit externen Kalendern
            </p>
          </div>
          <div className="grid gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start" 
              onClick={handleGoogleSync}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.64 12.2c0-.63-.06-1.25-.16-1.84H12v3.49h4.84a4.14 4.14 0 0 1-1.8 2.73v2.27h2.92a8.78 8.78 0 0 0 2.68-6.65z" fill="#4285F4"/>
                <path d="M12 21a8.6 8.6 0 0 0 5.96-2.18l-2.91-2.27a5.4 5.4 0 0 1-8.09-2.85h-3v2.34A9 9 0 0 0 12 21z" fill="#34A853"/>
                <path d="M5.96 13.7a5.32 5.32 0 0 1 0-3.4V7.96h-3a9 9 0 0 0 0 8.08l3-2.34z" fill="#FBBC05"/>
                <path d="M12 6.6c1.3 0 2.5.44 3.44 1.32l2.58-2.58A8.65 8.65 0 0 0 12 3a9 9 0 0 0-8.04 4.96l3 2.34A5.36 5.36 0 0 1 12 6.6z" fill="#EA4335"/>
              </svg>
              Google Kalender
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start" 
              onClick={handleAppleSync}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" fill="#999"/>
              </svg>
              Apple Kalender
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
