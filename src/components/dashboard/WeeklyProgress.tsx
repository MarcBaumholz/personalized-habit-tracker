import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";

interface WeeklyProgressProps {
  data: Array<{ name: string; completions: number }>;
}

export const WeeklyProgress = ({ data }: WeeklyProgressProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Wöchentlicher Fortschritt</h2>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="completions" stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};