import { Card } from "@/components/ui/card";

interface YearlyActivityProps {
  data: Array<Array<{ date: string; count: number }>>;
}

export const YearlyActivity = ({ data }: YearlyActivityProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Jahresübersicht</h2>
      <div className="grid grid-cols-52 gap-1">
        {data.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-rows-7 gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`w-3 h-3 rounded-sm ${
                  day.count === 0
                    ? 'bg-gray-100'
                    : day.count < 3
                    ? 'bg-primary/30'
                    : day.count < 5
                    ? 'bg-primary/60'
                    : 'bg-primary'
                }`}
                title={`${day.date}: ${day.count} completions`}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};