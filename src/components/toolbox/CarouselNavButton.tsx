
import { ArrowLeft, ArrowRight, LucideIcon } from "lucide-react";
import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface CarouselNavButtonProps {
  direction: 'prev' | 'next';
}

export const CarouselNavButton = ({ direction }: CarouselNavButtonProps) => {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight;
  const Component = direction === 'prev' ? CarouselPrevious : CarouselNext;

  return (
    <Component 
      className="hidden md:flex relative left-0 translate-x-0 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
    >
      <Icon className="w-4 h-4 md:w-6 md:h-6" />
    </Component>
  );
};
