
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ToolkitCard } from "./ToolkitCard";
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";

interface ToolboxCarouselProps {
  toolkits: any[];
  onSelect: (toolkit: any) => void;
  onRemove: (id: string) => void;
  onAdd: (toolkit: any) => void;
  activeTab: string;
}

export const ToolboxCarousel = ({ toolkits, onSelect, onRemove, onAdd, activeTab }: ToolboxCarouselProps) => {
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
        align: "center",
        loop: true,
      }}
      className="w-full max-w-6xl mx-auto"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {toolkits.map((toolkit, index) => (
          <CarouselItem key={toolkit.id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
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
      <div className="absolute -left-4 top-1/2 -translate-y-1/2">
        <CarouselPrevious className="bg-white/90 hover:bg-white" />
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2">
        <CarouselNext className="bg-white/90 hover:bg-white" />
      </div>
    </Carousel>
  );
};
