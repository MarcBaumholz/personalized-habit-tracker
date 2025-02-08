
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ToolkitCard } from "./ToolkitCard";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolboxCarouselProps {
  toolkits: any[];
  onSelect: (toolkit: any) => void;
  onRemove: (id: string) => void;
  onAdd: (toolkit: any) => void;
  activeTab: string;
}

export const ToolboxCarousel = ({ toolkits, onSelect, onRemove, onAdd, activeTab }: ToolboxCarouselProps) => {
  const isMobile = useIsMobile();

  if (toolkits.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600 mb-4">
          {activeTab === 'routines' 
            ? 'Du hast noch keine Routinen erstellt' 
            : 'Keine Einträge gefunden'}
        </p>
        <AddHabitDialog />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        className="w-full"
      >
        <div className="flex items-center">
          <CarouselPrevious 
            className="relative left-0 translate-x-0 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 md:w-6 md:h-6" />
          </CarouselPrevious>

          <CarouselContent className="-ml-1">
            {toolkits.map((toolkit, index) => (
              <CarouselItem 
                key={toolkit.id || index} 
                className={cn(
                  "pl-1 basis-full",
                  {
                    "sm:basis-1/2": !isMobile,
                    "lg:basis-1/3": !isMobile,
                    "xl:basis-1/4": !isMobile
                  }
                )}
              >
                <div className="p-1">
                  <ToolkitCard
                    toolkit={toolkit}
                    onSelect={onSelect}
                    onRemove={onRemove}
                    onAdd={onAdd}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselNext 
            className="relative right-0 translate-x-0 h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-lg"
          >
            <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
          </CarouselNext>
        </div>
      </Carousel>
    </div>
  );
};
