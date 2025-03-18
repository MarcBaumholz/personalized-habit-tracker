
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarPreferencesPopoverProps {
  calendarPreferences: any;
  onSavePreferences: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const CalendarPreferencesPopover: React.FC<CalendarPreferencesPopoverProps> = ({
  calendarPreferences,
  onSavePreferences
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Einstellungen</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <form onSubmit={onSavePreferences}>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Kalendereinstellungen</h4>
              <p className="text-sm text-muted-foreground">
                Passen Sie die Anzeige des Kalenders an
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="startTime">Startzeit</label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  className="col-span-2 h-8 rounded-md border border-input bg-background px-3"
                  defaultValue={calendarPreferences?.start_time?.slice(0, 5) || "06:00"}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <label htmlFor="endTime">Endzeit</label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  className="col-span-2 h-8 rounded-md border border-input bg-background px-3"
                  defaultValue={calendarPreferences?.end_time?.slice(0, 5) || "21:00"}
                />
              </div>
            </div>
            <Button type="submit" size="sm">Speichern</Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
};
