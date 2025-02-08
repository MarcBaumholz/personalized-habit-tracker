
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
    <div className="relative group">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-7xl mx-auto"
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
          <CarouselPrevious 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white shadow-lg"
            variant="outline"
            size="lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </CarouselPrevious>
        </div>
        <div className="hidden sm:block absolute -right-12 top-1/2 -translate-y-1/2">
          <CarouselNext 
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white shadow-lg"
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
