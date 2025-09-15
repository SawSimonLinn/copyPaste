"use client";
import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Search, Link as LinkIcon, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useClipboardStore } from "@/hooks/use-clipboard-store";
import { ClipboardItemCard } from "@/components/clipboard-item-card";
import { SortableItem } from "@/components/sortable-item";
import { ClipboardItem } from "@/lib/clipboard-types";
import { ClipboardItemDialog } from "@/components/clipboard-item-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const { items, reorderItems, addItem, updateItem, removeItem } =
    useClipboardStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClipboardItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "links" | "text">("all");
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderItems(active.id as string, over.id as string);
    }
  };

  const handleOpenDialog = (item: ClipboardItem | null = null) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSaveItem = (itemData: ClipboardItem) => {
    if (editingItem) {
      updateItem(itemData);
    } else {
      addItem(itemData);
    }
    handleCloseDialog();
  };

  const handleOpenDeleteConfirm = (id: string) => {
    setDeletingItemId(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeletingItemId(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleDelete = () => {
    if (deletingItemId) {
      removeItem(deletingItemId);
      handleCloseDeleteConfirm();
    }
  };

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (filter === "links")
          return item.content.some((c) => c.type === "link");
        if (filter === "text")
          return item.content.some((c) => c.type === "text");
        return true;
      })
      .filter((item) => {
        if (!searchTerm) return true;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          item.title.toLowerCase().includes(lowerSearchTerm) ||
          item.content.some((c) =>
            c.value.toLowerCase().includes(lowerSearchTerm)
          )
        );
      });
  }, [items, filter, searchTerm]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-grow">
        <header className="p-4 sm:p-6 sticky top-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm z-10 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold font-headline">
              copy paste
            </h1>
            <div className="flex items-center gap-2">
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search snippets..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={filter === "all" ? "secondary" : "ghost"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "links" ? "secondary" : "ghost"}
                onClick={() => setFilter("links")}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Links
              </Button>
              <Button
                variant={filter === "text" ? "secondary" : "ghost"}
                onClick={() => setFilter("text")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Text
              </Button>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6">
          {items.length > 0 ? (
            filteredItems.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredItems.map((i) => i.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                      <SortableItem key={item.id} id={item.id}>
                        <ClipboardItemCard
                          item={item}
                          onEdit={() => handleOpenDialog(item)}
                          onDelete={() => handleOpenDeleteConfirm(item.id)}
                        />
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <Search className="h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-medium">No Matching Snippets</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Your search for &quot;{searchTerm}&quot;{" "}
                  {filter !== "all" ? `in ${filter}` : ""} did not return any
                  results.
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-medium">No Snippets Yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4 max-w-md">
                This is your personal clipboard. Add frequently used text,
                links, or code snippets for easy access and copying.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Snippet
              </Button>
            </div>
          )}
        </div>

        <ClipboardItemDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onSave={handleSaveItem}
          item={editingItem}
        />

        <AlertDialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                snippet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCloseDeleteConfirm}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-4 px-6 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <p>Developed by Saw Simon Linn.</p>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/SawSimonLinn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/sawsimonlinn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://www.simonlinn.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Portfolio
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
