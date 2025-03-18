
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
            margin={{ top: 20, right: 20, left: 20, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              width={45}
              tickMargin={10}
              domain={[0, 'auto']}
              padding={{ top: 20 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }} 
              formatter={(value) => [`${value}`, 'Abschlüsse']}
            />
            <Line 
              type="monotone" 
              dataKey="completions" 
              stroke="#8B5CF6"
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
