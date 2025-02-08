
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
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-7xl mx-auto relative"
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
      <div className="hidden sm:block absolute -left-12 top-1/2 -translate-y-1/2">
        <CarouselPrevious className="bg-white/90 hover:bg-white shadow-lg" />
      </div>
      <div className="hidden sm:block absolute -right-12 top-1/2 -translate-y-1/2">
        <CarouselNext className="bg-white/90 hover:bg-white shadow-lg" />
      </div>
    </Carousel>
  );
};
