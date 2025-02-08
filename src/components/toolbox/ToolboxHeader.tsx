
import { Star, Users, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ToolboxHeaderProps {
  activeTab: 'routines' | 'community' | 'inspiration';
  onTabChange: (tab: 'routines' | 'community' | 'inspiration') => void;
}

export const ToolboxHeader = ({ activeTab, onTabChange }: ToolboxHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-800">
          Habit Baukasten
        </h1>
      </div>
      
      <div className="flex justify-between border-b border-purple-100">
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            activeTab === 'routines' 
              ? "text-purple-700 border-b-2 border-purple-500" 
              : "text-gray-600 hover:text-gray-900"
          )}
          onClick={() => onTabChange('routines')}
        >
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {!isMobile && "Meine Routinen"}
          </div>
          {activeTab === 'routines' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-purple-600" />
          )}
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            activeTab === 'community' 
              ? "text-purple-700 border-b-2 border-purple-500" 
              : "text-gray-600 hover:text-gray-900"
          )}
          onClick={() => onTabChange('community')}
        >
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {!isMobile && "Community"}
          </div>
          {activeTab === 'community' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-purple-600" />
          )}
        </button>
        <button
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors relative",
            activeTab === 'inspiration' 
              ? "text-purple-700 border-b-2 border-purple-500" 
              : "text-gray-600 hover:text-gray-900"
          )}
          onClick={() => onTabChange('inspiration')}
        >
          <div className="flex items-center gap-2">
            <Sparkle className="h-4 w-4" />
            {!isMobile && "Inspiration"}
          </div>
          {activeTab === 'inspiration' && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-purple-600" />
          )}
        </button>
      </div>
    </div>
  );
};
