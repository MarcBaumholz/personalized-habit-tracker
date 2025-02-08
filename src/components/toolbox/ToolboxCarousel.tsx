
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
    <div className="relative flex items-center justify-center w-full max-w-full">
      <div className="absolute left-0 z-10 -ml-4 lg:-ml-8">
        <CarouselPrevious 
          className="relative !static flex bg-white/90 hover:bg-white shadow-lg"
          variant="outline"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 md:w-6 md:h-6" />
        </CarouselPrevious>
      </div>

      <div className="w-full px-2 md:px-4">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full mx-auto"
        >
          <CarouselContent>
            {toolkits.map((toolkit, index) => (
              <CarouselItem 
                key={toolkit.id || index} 
                className={`${isMobile ? 'basis-full' : 'basis-1/3'} pl-4`}
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
        </Carousel>
      </div>

      <div className="absolute right-0 z-10 -mr-4 lg:-mr-8">
        <CarouselNext 
          className="relative !static flex bg-white/90 hover:bg-white shadow-lg"
          variant="outline"
          size="lg"
        >
          <ArrowRight className="w-4 h-4 md:w-6 md:h-6" />
        </CarouselNext>
      </div>
    </div>
  );
};
