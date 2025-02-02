import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";

const data = [
  { name: 'Mo', completed: 4, total: 5 },
  { name: 'Di', completed: 3, total: 5 },
  { name: 'Mi', completed: 5, total: 5 },
  { name: 'Do', completed: 4, total: 5 },
  { name: 'Fr', completed: 3, total: 5 },
  { name: 'Sa', completed: 2, total: 5 },
  { name: 'So', completed: 4, total: 5 },
];

export const DashboardOverview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dein Fortschritt</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aktuelle Streak</p>
            <p className="text-2xl font-bold">7 Tage</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Erfolgsquote</p>
            <p className="text-2xl font-bold">85%</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Aktive Tage</p>
            <p className="text-2xl font-bold">24/30</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fortschritt</p>
            <p className="text-2xl font-bold">36%</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Wöchentliche Übersicht</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Gesamtfortschritt zum Automatismus</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Deep Work</span>
              <span>36/66 Tage</span>
            </div>
            <Progress value={54} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Meditation</span>
              <span>12/66 Tage</span>
            </div>
            <Progress value={18} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sport</span>
              <span>45/66 Tage</span>
            </div>
            <Progress value={68} />
          </div>
        </div>
      </Card>
    </div>
  );
};