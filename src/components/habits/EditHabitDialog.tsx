
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EditHabitDialog = ({ habit }: { habit: any }) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/habits/${habit.id}`);
  };

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleEdit}>
      <Pencil className="h-4 w-4" />
    </Button>
  );
};
