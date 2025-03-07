
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BuildingBlock {
  id: string;
  name: string;
  description: string | null;
  category: string;
  impact_area: string[];
  created_at: string;
  is_favorite?: boolean;
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: buildingBlocks } = useQuery<BuildingBlock[]>({
    queryKey: ['building-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('building_blocks')
        .select('*');
      
      if (error) throw error;
      return (data as BuildingBlock[]) || [];
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (toolkit: any) => {
      // Skip if toolkit doesn't have an ID (like inspiration items)
      if (!toolkit.id) return;

      let tableName = 'habits';
      
      // Determine which table to update based on toolkit type
      if (toolkit.type === 'building_block') {
        tableName = 'building_blocks';
      } else if (activeTab === 'favorites') {
        tableName = 'habits';
      }
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_favorite: !toolkit.is_favorite })
        .eq('id', toolkit.id);
      
      if (error) throw error;
      
      return { ...toolkit, is_favorite: !toolkit.is_favorite };
    },
    onSuccess: (updatedToolkit) => {
      if (!updatedToolkit) return;
      
      queryClient.invalidateQueries({ queryKey: ['building-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['active-routines'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-toolkits'] });
      
      toast({
        title: updatedToolkit.is_favorite ? "Zu Favoriten hinzugefügt" : "Aus Favoriten entfernt",
        description: `"${updatedToolkit.title || updatedToolkit.name}" wurde ${updatedToolkit.is_favorite ? "zu deinen Favoriten hinzugefügt" : "aus deinen Favoriten entfernt"}.`,
      });
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Der Favoritenstatus konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  });

  const handleToggleFavorite = (toolkit: any) => {
    toggleFavoriteMutation.mutate(toolkit);
  };

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
                    onToggleFavorite={handleToggleFavorite}
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
