
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";

interface WeeklyProgressProps {
  data: Array<{ name: string; completions: number }>;
}

export const WeeklyProgress = ({ data }: WeeklyProgressProps) => {
  return (
    <Card className="p-4 md:p-6">
      <h2 className="text-lg font-semibold mb-4">Wöchentlicher Fortschritt</h2>
      <div className="h-[250px] md:h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              width={30}
            />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="completions" 
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
