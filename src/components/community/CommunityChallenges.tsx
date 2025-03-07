
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChallengeCard, ChallengeProps } from "./ChallengeCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Search, Filter, Plus } from "lucide-react";

// Sample data for demo
const SAMPLE_CHALLENGES: ChallengeProps[] = [
  {
    id: '1',
    title: '100 km Laufen',
    description: 'Gemeinsam 100 km in einem Monat laufen',
    category: 'Fitness',
    target: {
      value: 100,
      unit: 'km'
    },
    currentProgress: 63,
    endDate: '2023-11-30',
    participants: [
      { id: '1', name: 'Anna Schmidt', avatar: '', progress: 15 },
      { id: '2', name: 'Max Mustermann', avatar: '', progress: 22 },
      { id: '3', name: 'Laura Meyer', avatar: '', progress: 10 },
      { id: '4', name: 'Thomas Weber', avatar: '', progress: 8 },
      { id: '5', name: 'Sarah Wagner', avatar: '', progress: 5 },
      { id: '6', name: 'Michael Becker', avatar: '', progress: 3 }
    ],
    isJoined: true
  },
  {
    id: '2',
    title: '30 Tage Meditation',
    description: 'Jeden Tag 10 Minuten meditieren',
    category: 'Achtsamkeit',
    target: {
      value: 300,
      unit: 'Minuten'
    },
    currentProgress: 210,
    endDate: '2023-12-15',
    participants: [
      { id: '1', name: 'Anna Schmidt', avatar: '', progress: 70 },
      { id: '2', name: 'Max Mustermann', avatar: '', progress: 80 },
      { id: '3', name: 'Sarah Wagner', avatar: '', progress: 60 }
    ],
    isJoined: false
  },
  {
    id: '3',
    title: '1000 Seiten lesen',
    description: 'Gemeinsam 1000 Seiten in einem Monat lesen',
    category: 'Bildung',
    target: {
      value: 1000,
      unit: 'Seiten'
    },
    currentProgress: 450,
    endDate: '2023-12-31',
    participants: [
      { id: '1', name: 'Laura Meyer', avatar: '', progress: 150 },
      { id: '2', name: 'Thomas Weber', avatar: '', progress: 125 },
      { id: '3', name: 'Sarah Wagner', avatar: '', progress: 100 },
      { id: '4', name: 'Michael Becker', avatar: '', progress: 75 }
    ],
    isJoined: true
  }
];

export const CommunityChallenges = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredChallenges = SAMPLE_CHALLENGES.filter(challenge => 
    challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const joinedChallenges = filteredChallenges.filter(challenge => challenge.isJoined);
  const availableChallenges = filteredChallenges.filter(challenge => !challenge.isJoined);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Challenges durchsuchen..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Neue Challenge
          </Button>
        </div>
      </div>
      
      {joinedChallenges.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-xl mb-6 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Deine Challenges
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id}
                  {...challenge}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-xl mb-6">Verfügbare Challenges</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableChallenges.length > 0 ? (
              availableChallenges.map(challenge => (
                <ChallengeCard 
                  key={challenge.id}
                  {...challenge}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500">Keine Challenges gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
