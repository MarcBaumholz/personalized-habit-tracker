
import React from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface TimeHeaderProps {
  day: Date;
}

export const TimeHeader: React.FC<TimeHeaderProps> = ({ day }) => {
  return (
    <div className="border-b py-4 text-center font-medium bg-blue-50">
      <div className="text-blue-700">
        {format(day, "EEEE", { locale: de })}
      </div>
      <div className="text-blue-600">
        {format(day, "dd.MM.", { locale: de })}
      </div>
    </div>
  );
};
