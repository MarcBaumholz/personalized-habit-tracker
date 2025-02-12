
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { ToolkitCard } from "./ToolkitCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { EmptyToolboxState } from "./EmptyToolboxState";
import { CarouselNavButton } from "./CarouselNavButton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BuildingBlock {
  id: string;
  name: string;
  description: string;
  category: string;
  impact_area: string[];
  created_at: string;
}

interface ToolboxCarouselProps {
  toolkits: any[];
  onSelect: (toolkit: any) => void;
  onRemove: (id: string) => void;
  onAdd: (toolkit: any) => void;
  activeTab: string;
}

export const ToolboxCarousel = ({ toolkits = [], onSelect, onRemove, onAdd, activeTab }: ToolboxCarouselProps) => {
  const isMobile = useIsMobile();

  const { data: buildingBlocks } = useQuery<BuildingBlock[]>({
    queryKey: ['building-blocks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('building_blocks')
        .select('*')
        .returns<BuildingBlock[]>();
      return data || [];
    },
  });

  const combinedToolkits = activeTab === 'inspiration' 
    ? [...toolkits, ...(buildingBlocks || []).map(block => ({
        ...block,
        type: 'building_block',
        title: block.name,
        steps: block.impact_area,
      }))]
    : toolkits;

  if (combinedToolkits.length === 0) {
    return <EmptyToolboxState activeTab={activeTab} />;
  }

  return (
    <div className="w-full mx-auto px-4 sm:px-6">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        className="w-full relative"
      >
        <div className="flex items-center w-full gap-8">
          <CarouselNavButton direction="prev" />

          <CarouselContent className="w-full">
            {combinedToolkits.map((toolkit, index) => (
              <CarouselItem 
                key={toolkit.id || index} 
                className={cn(
                  "pl-2 md:pl-4",
                  isMobile ? "basis-full" : "basis-full lg:basis-1/2"
                )}
              >
                <div className="p-2">
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

          <CarouselNavButton direction="next" />
        </div>
      </Carousel>
    </div>
  );
};
