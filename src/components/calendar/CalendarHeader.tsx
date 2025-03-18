
import { Button } from "@/components/ui/button";
import { CalendarRange, Settings } from "lucide-react";
import { CalendarPreferencesPopover } from "./CalendarPreferencesPopover";
import { CalendarSync } from "@/components/calendar/CalendarSync";

interface CalendarHeaderProps {
  calendarPreferences: any;
  onSavePreferences: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  calendarPreferences,
  onSavePreferences
}) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold text-blue-800 flex items-center">
        <CalendarRange className="h-8 w-8 mr-2 text-blue-600" />
        Kalenderansicht
      </h1>
      <div className="flex gap-2">
        <CalendarSync />
        <CalendarPreferencesPopover 
          calendarPreferences={calendarPreferences} 
          onSavePreferences={onSavePreferences} 
        />
      </div>
    </div>
  );
};
