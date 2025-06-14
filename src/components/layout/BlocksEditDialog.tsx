
import React, { useEffect, useState } from "react";
import { DndContext, closestCenter, useDroppable, useDraggable, SortableContext, arrayMove, rectSortingStrategy } from "@dnd-kit/core";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type Block = {
  id: string;
  label: string;
  url: string;
  icon: string;
  archived?: boolean;
};

const DEFAULT_BLOCKS: Block[] = [
  { id: "dashboard", label: "Dashboard", url: "/dashboard", icon: "LayoutDashboard" },
  { id: "calendar", label: "Kalender", url: "/calendar", icon: "Calendar" },
  { id: "toolbox", label: "Toolbox", url: "/toolbox", icon: "Package" },
  { id: "archive", label: "Archiv", url: "/archive", icon: "Package" },
  { id: "profile", label: "Profil", url: "/profile", icon: "User" }
];

function getBlocksFromStorage(): Block[] {
  try {
    const stored = localStorage.getItem("nav_blocks");
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_BLOCKS;
}

function saveBlocksToStorage(blocks: Block[]) {
  try {
    localStorage.setItem("nav_blocks", JSON.stringify(blocks));
  } catch {}
}

function getLucideIcon(iconName: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { [iconName]: LucideIcon } = require("lucide-react");
  return LucideIcon ?? require("lucide-react").Edit;
}

export const BlocksEditDialog = ({
  open,
  onOpenChange,
  blocks,
  setBlocks
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blocks: Block[];
  setBlocks: (blocks: Block[]) => void;
}) => {
  const [editBlocks, setEditBlocks] = useState<Block[]>(blocks);
  const [newBlockLabel, setNewBlockLabel] = useState("");
  const [newBlockUrl, setNewBlockUrl] = useState("");
  const [newBlockIcon, setNewBlockIcon] = useState("Edit");
  const { toast } = useToast();

  useEffect(() => {
    setEditBlocks(blocks);
  }, [blocks, open]);

  const handleAddBlock = () => {
    if (!newBlockLabel.trim() || !newBlockUrl.trim()) return;
    setEditBlocks([
      ...editBlocks,
      { id: Math.random().toString(36).slice(2), label: newBlockLabel.trim(), url: newBlockUrl.trim(), icon: newBlockIcon }
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
    if (active.id !== over.id) {
      const oldIndex = editBlocks.findIndex(b => b.id === active.id);
      const newIndex = editBlocks.findIndex(b => b.id === over.id);
      setEditBlocks(arrayMove(editBlocks, oldIndex, newIndex));
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
              className="w-20"
            />
            <Button onClick={handleAddBlock} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editable blocks list */}
        <div className="border rounded p-2 bg-muted/30">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={editBlocks.map(b => b.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-col gap-2">
                {editBlocks.map((block, i) => {
                  const LucideIcon = getLucideIcon(block.icon);
                  return (
                    <div
                      key={block.id}
                      className={`flex items-center justify-between bg-white rounded px-2 py-1 border shadow-sm transition-opacity ${block.archived ? "opacity-50" : ""}`}
                      data-id={block.id}
                      draggable
                      style={{ cursor: "grab" }}
                    >
                      <div className="flex gap-2 items-center">
                        <LucideIcon className="h-4 w-4" />
                        <span>{block.label}</span>
                        <span className="font-mono text-xs text-gray-400">{block.url}</span>
                      </div>
                      <div className="flex gap-1">
                        {!block.archived ? (
                          <Button variant="ghost" size="sm" onClick={() => handleArchive(block.id)}>
                            Archivieren
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => handleUnarchive(block.id)}>
                            Reaktivieren
                          </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => handleRemove(block.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
