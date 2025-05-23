
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Profile {
  id?: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
}

interface ProofItem {
  id: string;
  user_id: string;
  challenge_id: string;
  image_url: string;
  created_at: string;
  progress_value: number;
  profiles?: Profile | null;
}

interface ProofCarouselProps {
  date: string;
  proofs: ProofItem[];
  targetUnit: string;
  currentUserId?: string;
  onDeleteProof: (proof: ProofItem) => void;
}

export const ProofCarousel = ({
  date,
  proofs,
  targetUnit,
  currentUserId,
  onDeleteProof
}: ProofCarouselProps) => {
  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-700">
        {new Date(date).toLocaleDateString('de-DE', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </h4>
      <Carousel className="w-full">
        <CarouselContent>
          {proofs.map(proof => (
            <CarouselItem key={proof.id} className="md:basis-1/3 lg:basis-1/4">
              <div className="bg-gray-50 rounded-lg p-3 h-full relative">
                <div className="aspect-square w-full relative overflow-hidden rounded-md mb-2">
                  <img 
                    src={proof.image_url} 
                    alt="Proof" 
                    className="object-cover w-full h-full" 
                  />
                  
                  {currentUserId === proof.user_id && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-opacity-70"
                      onClick={() => onDeleteProof(proof)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={proof.profiles?.avatar_url} />
                    <AvatarFallback>
                      {proof.profiles?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium truncate">
                      {proof.profiles?.full_name || 'Anonym'}
                    </p>
                    <p className="text-xs text-gray-500">
                      +{proof.progress_value} {targetUnit}
                    </p>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
