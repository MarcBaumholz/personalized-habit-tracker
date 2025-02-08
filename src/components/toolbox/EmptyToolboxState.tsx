
import { AddHabitDialog } from "@/components/habits/AddHabitDialog";

interface EmptyToolboxStateProps {
  activeTab: string;
}

export const EmptyToolboxState = ({ activeTab }: EmptyToolboxStateProps) => {
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
};
