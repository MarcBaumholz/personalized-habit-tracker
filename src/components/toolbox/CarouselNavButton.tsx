
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface CarouselNavButtonProps {
  direction: 'prev' | 'next';
}

export const CarouselNavButton = ({ direction }: CarouselNavButtonProps) => {
  const Icon = direction === 'prev' ? ArrowLeft : ArrowRight;
  const Component = direction === 'prev' ? CarouselPrevious : CarouselNext;

  return (
    <Component 
      className={cn(
        "hidden md:flex relative left-0 translate-x-0",
        "h-8 w-8 rounded-full",
        "bg-white/90 hover:bg-white",
        "shadow-lg border border-purple-100",
        "transition-all duration-200 ease-in-out",
        "hover:scale-110"
      )}
    >
      <Icon className="w-4 h-4 text-purple-600" />
    </Component>
  );
};
