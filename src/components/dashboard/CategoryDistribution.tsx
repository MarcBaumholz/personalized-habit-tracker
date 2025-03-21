
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  value: number;
}

interface CategoryDistributionProps {
  data: CategoryData[];
}

export const CategoryDistribution = ({ data }: CategoryDistributionProps) => {
  const COLORS = ["#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#22C55E"];

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-lg font-semibold mb-4">Kategorienverteilung</h3>
      <div className="h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value}`, 'Anzahl']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #f0f0f0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            />
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
