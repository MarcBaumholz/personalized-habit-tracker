
import React from 'react';
import { Check, Minus } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { de } from 'date-fns/locale'; // Import the German locale
import { cn } from '@/lib/utils';

export type DayStatus = 'completed' | 'partial' | null;

interface WeeklyDayTrackerProps {
  weekDates: Date[];
  completions: { date: string; status: DayStatus }[];
  onDayToggle: (date: Date, currentStatus: DayStatus) => void;
}

// German day labels assuming weekDates array is Mon, Tue, ..., Sun
const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const WeeklyDayTracker: React.FC<WeeklyDayTrackerProps> = ({
  weekDates,
  completions,
  onDayToggle,
}) => {
  return (
    <div className="flex justify-around items-center mt-2 mb-1">
      {weekDates.map((date, index) => {
        const dateString = format(date, 'yyyy-MM-dd');
        const completion = completions.find(c => c.date === dateString);
        const status = completion ? completion.status : null;
        
        let bgColor = 'bg-gray-200 hover:bg-gray-300';
        let iconOrDayNumber = <span className={cn("text-xs", isToday(date) ? "font-bold text-blue-700" : "text-gray-700")}>{format(date, 'd')}</span>;

        if (status === 'completed') {
          bgColor = 'bg-green-500 hover:bg-green-600';
          iconOrDayNumber = <Check size={16} className="text-white" />;
        } else if (status === 'partial') {
          bgColor = 'bg-yellow-400 hover:bg-yellow-500';
          iconOrDayNumber = <Minus size={16} className="text-white" />;
        }

        return (
          <div key={dateString} className="flex flex-col items-center">
            <button
              onClick={() => onDayToggle(date, status)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                bgColor,
                isToday(date) && 'ring-2 ring-blue-500 ring-offset-1'
              )}
              aria-label={`Status für ${format(date, 'EEEE, d. MMMM', { locale: de })}`}
            >
              {iconOrDayNumber}
            </button>
            <span className="text-xs text-gray-500 mt-1 block">{dayLabels[index]}</span>
          </div>
        );
      })}
    </div>
  );
};

