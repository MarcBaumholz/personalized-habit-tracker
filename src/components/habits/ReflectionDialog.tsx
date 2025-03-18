
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReflectionTab } from "./reflection/ReflectionTab";
import { SrhiTab } from "./reflection/SrhiTab";
import { HistoryTab } from "./reflection/HistoryTab";

interface ReflectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
  responses: Record<number, string>;
  onResponseChange: (index: number, value: string) => void;
  reflection: string;
  onReflectionChange: (value: string) => void;
  onSubmit: (reflection: string, obstacles: string, srhiResponses?: Record<number, string>) => void;
  habit?: any;
}

export const ReflectionDialog = ({
  isOpen,
  onClose,
  questions,
  habit,
  onSubmit,
}: ReflectionDialogProps) => {
  const [activeTab, setActiveTab] = useState("reflection");
  
  // Reset states when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("reflection");
    }
  }, [isOpen]);
  
  const handleReflectionSubmit = (reflection: string, obstacles: string) => {
    onSubmit(reflection, obstacles, undefined);
    onClose();
  };

  const handleSrhiSubmit = (srhiResponses: Record<number, string>) => {
    onSubmit("", "", srhiResponses);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reflexion: {habit?.name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="reflection">Reflexion</TabsTrigger>
            <TabsTrigger value="srhi">SRHI</TabsTrigger>
            <TabsTrigger value="history">Verlauf</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reflection">
            <ReflectionTab 
              onSubmit={handleReflectionSubmit}
              onClose={onClose}
            />
          </TabsContent>
          
          <TabsContent value="srhi">
            <SrhiTab 
              questions={questions}
              onSubmit={handleSrhiSubmit}
              onClose={onClose}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <HistoryTab 
              habit={habit}
              questions={questions}
              onClose={onClose}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
