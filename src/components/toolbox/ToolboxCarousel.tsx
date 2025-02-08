
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
    <div className="relative group max-w-full overflow-hidden px-10">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full mx-auto"
      >
        <CarouselContent>
          {toolkits.map((toolkit, index) => (
            <CarouselItem key={toolkit.id || index} className={`${isMobile ? 'basis-full' : 'basis-1/3'} pl-4`}>
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

        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <CarouselPrevious 
            className="bg-white/90 hover:bg-white shadow-lg relative !static flex"
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </CarouselPrevious>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <CarouselNext 
            className="bg-white/90 hover:bg-white shadow-lg relative !static flex"
            variant="outline"
            size="lg"
          >
            <ArrowRight className="w-6 h-6" />
          </CarouselNext>
        </div>
      </Carousel>
    </div>
  );
};

