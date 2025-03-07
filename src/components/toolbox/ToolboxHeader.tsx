
import { Star, Users, Sparkle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ToolboxHeaderProps {
  activeTab: 'routines' | 'community' | 'inspiration' | 'building-blocks';
  onTabChange: (tab: 'routines' | 'community' | 'inspiration' | 'building-blocks') => void;
}

export const ToolboxHeader = ({ activeTab, onTabChange }: ToolboxHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Habit Baukasten
          </h1>
          <p className="text-gray-600 max-w-xl">
            Entdecke bewährte Gewohnheitsmuster und Bausteine für deine persönliche Entwicklung
          </p>
        </div>
      </div>
      
      <div className="flex border-b border-gray-200 w-full md:w-[500px] bg-white rounded-t-lg shadow-sm">
        <TabButton
          isActive={activeTab === 'routines'}
          onClick={() => onTabChange('routines')}
          icon={<Star className="h-5 w-5" />}
          label="Routinen"
          isMobile={isMobile}
        />
        <TabButton
          isActive={activeTab === 'building-blocks'}
          onClick={() => onTabChange('building-blocks')}
          icon={<Package className="h-5 w-5" />}
          label="Bausteine"
          isMobile={isMobile}
        />
        <TabButton
          isActive={activeTab === 'community'}
          onClick={() => onTabChange('community')}
          icon={<Users className="h-5 w-5" />}
          label="Community"
          isMobile={isMobile}
        />
        <TabButton
          isActive={activeTab === 'inspiration'}
          onClick={() => onTabChange('inspiration')}
          icon={<Sparkle className="h-5 w-5" />}
          label="Inspiration"
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isMobile: boolean;
}

const TabButton = ({ isActive, onClick, icon, label, isMobile }: TabButtonProps) => (
  <button
    className={cn(
      "px-6 py-4 text-base font-medium transition-all duration-200 relative",
      "hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-lg",
      isActive 
        ? "text-blue-600 bg-white" 
        : "text-gray-600 hover:bg-white/50"
    )}
    onClick={onClick}
  >
    <div className="flex items-center gap-2">
      {icon}
      {!isMobile && label}
    </div>
    {isActive && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-blue-400" />
    )}
  </button>
);
