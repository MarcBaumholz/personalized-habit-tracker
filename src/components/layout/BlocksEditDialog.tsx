import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Edit, icons as lucideIcons } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type Block = {
  id: string;
  label: string;
  url: string;
  icon: string;
  archived: boolean; // Changed from archived?: boolean
};

const DEFAULT_BLOCKS: Block[] = [
  { id: "dashboard", label: "Dashboard", url: "/dashboard", icon: "LayoutDashboard", archived: false },
  { id: "calendar", label: "Kalender", url: "/calendar", icon: "Calendar", archived: false },
  { id: "toolbox", label: "Toolbox", url: "/toolbox", icon: "Package", archived: false },
  { id: "archive", label: "Archiv", url: "/archive", icon: "Package", archived: false }, // Note: "Archiv" here is a page label
  { id: "profile", label: "Profil", url: "/profile", icon: "User", archived: false }
];

// This local getBlocksFromStorage is mostly for the DEFAULT_BLOCKS constant if needed elsewhere,
// but primary state comes from Navigation props.
function getBlocksFromStorage(): Block[] {
  try {
    const stored = localStorage.getItem("nav_blocks");
    if (stored) {
      const parsedBlocks = JSON.parse(stored) as Partial<Block>[];
      return parsedBlocks.map(b => ({
        id: b.id || Math.random().toString(36).slice(2),
        label: b.label || "Untitled",
        url: b.url || "/",
        icon: b.icon || "Edit",
        archived: typeof b.archived === 'boolean' ? b.archived : false,
      })) as Block[];
    }
  } catch {}
  return DEFAULT_BLOCKS.map(b => ({ ...b })); // Return a copy
}

function saveBlocksToStorage(blocks: Block[]) {
  try {
    localStorage.setItem("nav_blocks", JSON.stringify(blocks));
  } catch {}
}

function getLucideIconComponent(iconName: string): React.ElementType {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons];
  return IconComponent || Edit;
}

// Sortable Item Component
const SortableBlockItem = ({ 
  block, 
  onArchive, 
  onUnarchive, 
  onRemove 
}: { 
  block: Block; 
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  const LucideIcon = getLucideIconComponent(block.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center justify-between bg-white rounded px-2 py-1 border shadow-sm transition-opacity ${block.archived ? "opacity-50" : ""}`}
    >
      <div className="flex gap-2 items-center">
        <LucideIcon className="h-4 w-4" />
        <span>{block.label}</span>
        <span className="font-mono text-xs text-gray-400">{block.url}</span>
      </div>
      <div className="flex gap-1">
        {!block.archived ? (
          <Button variant="ghost" size="sm" onClick={() => onArchive(block.id)}>
            Archivieren
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => onUnarchive(block.id)}>
            Reaktivieren
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={() => onRemove(block.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


export const BlocksEditDialog = ({
  open,
  onOpenChange,
  blocks, // This comes from Navigation's state
  setBlocks
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}) => {
  const [editBlocks, setEditBlocks] = useState<Block[]>([]);
  const [newBlockLabel, setNewBlockLabel] = useState("");
  const [newBlockUrl, setNewBlockUrl] = useState("");
  const [newBlockIcon, setNewBlockIcon] = useState("Edit");
  const { toast } = useToast();

  useEffect(() => {
    // Initialize editBlocks with a deep copy of the blocks prop when dialog opens or prop changes.
    // Ensure all blocks have the 'archived' property.
    if (open) {
      const initializedBlocks = blocks.map(b => ({
        ...b,
        archived: typeof b.archived === 'boolean' ? b.archived : false,
      }));
      setEditBlocks(JSON.parse(JSON.stringify(initializedBlocks)));
    }
  }, [blocks, open]);

  const handleAddBlock = () => {
    if (!newBlockLabel.trim() || !newBlockUrl.trim()) return;
    const formattedIcon = newBlockIcon.trim() || "Edit";
    setEditBlocks([
      ...editBlocks,
      { 
        id: Math.random().toString(36).slice(2), 
        label: newBlockLabel.trim(), 
        url: newBlockUrl.trim(), 
        icon: formattedIcon,
        archived: false // Explicitly set archived to false for new blocks
      }
    ]);
    setNewBlockLabel("");
    setNewBlockUrl("");
    setNewBlockIcon("Edit");
  };

  const handleArchive = (id: string) => {
    setEditBlocks(editBlocks.map(b => b.id === id ? { ...b, archived: true } : b));
  };

  const handleUnarchive = (id: string) => {
    setEditBlocks(editBlocks.map(b => b.id === id ? { ...b, archived: false } : b));
  };

  const handleRemove = (id: string) => {
    setEditBlocks(editBlocks.filter(b => b.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = editBlocks.findIndex(b => b.id === active.id);
      const newIndex = editBlocks.findIndex(b => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setEditBlocks(arrayMove(editBlocks, oldIndex, newIndex));
      }
    }
  };

  const handleSave = () => {
    setBlocks(editBlocks); 
    saveBlocksToStorage(editBlocks); 
    onOpenChange(false);
    toast({
      title: "Menü aktualisiert",
      description: "Die Bausteine deines Menüs wurden aktualisiert.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bausteine bearbeiten</DialogTitle>
          <DialogDescription>
            Füge Seiten hinzu, archiviere sie oder sortiere sie per Drag & Drop.
          </DialogDescription>
        </DialogHeader>

        {/* Add block */}
        <div className="space-y-2 mb-4">
          <div className="flex gap-2 items-end">
            <Input
              placeholder="Name (z. B. Community)"
              value={newBlockLabel}
              onChange={e => setNewBlockLabel(e.target.value)}
            />
            <Input
              placeholder="URL (z. B. /community)"
              value={newBlockUrl}
              onChange={e => setNewBlockUrl(e.target.value)}
            />
            <Input
              placeholder="Icon (z. B. Edit)"
              value={newBlockIcon}
              onChange={e => setNewBlockIcon(e.target.value)}
              className="w-28"
            />
            <Button onClick={handleAddBlock} variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editable blocks list */}
        <div className="border rounded p-2 bg-muted/30 max-h-80 overflow-y-auto">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={editBlocks.map(b => b.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-col gap-2">
                {editBlocks.map((block) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
