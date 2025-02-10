
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
        "h-10 w-10 rounded-full",
        "bg-white hover:bg-gray-50",
        "shadow-lg border border-gray-200",
        "transition-all duration-200 ease-in-out",
        "hover:scale-110"
      )}
    >
      <Icon className="w-5 h-5 text-gray-700" />
    </Component>
  );
};
