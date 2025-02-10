
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
        "relative left-0 translate-x-0 z-10",
        "h-14 w-14 rounded-full",
        "bg-white hover:bg-blue-50",
        "shadow-lg border border-gray-200",
        "transition-all duration-200 ease-in-out",
        "hover:scale-110",
        "flex items-center justify-center"
      )}
    >
      <Icon className="w-7 h-7 text-blue-600" />
    </Component>
  );
};
