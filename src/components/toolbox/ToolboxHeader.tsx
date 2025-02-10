
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
          Habit Baukasten
        </h1>
      </div>
      
      <div className="flex border-b border-gray-200 w-full md:w-[400px] bg-white rounded-t-lg shadow-sm">
        <TabButton
          isActive={activeTab === 'routines'}
          onClick={() => onTabChange('routines')}
          icon={<Star className="h-4 w-4" />}
          label="Routinen"
          isMobile={isMobile}
        />
        <TabButton
          isActive={activeTab === 'community'}
          onClick={() => onTabChange('community')}
          icon={<Users className="h-4 w-4" />}
          label="Community"
          isMobile={isMobile}
        />
        <TabButton
          isActive={activeTab === 'inspiration'}
          onClick={() => onTabChange('inspiration')}
          icon={<Sparkle className="h-4 w-4" />}
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
      "px-4 py-3 text-sm font-medium transition-all duration-200 relative",
      "hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-lg",
      isActive 
        ? "text-blue-700 bg-white" 
        : "text-gray-600 hover:bg-white/50"
    )}
    onClick={onClick}
  >
    <div className="flex items-center gap-1.5">
      {icon}
      {!isMobile && label}
    </div>
    {isActive && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-sky-500" />
    )}
  </button>
);
