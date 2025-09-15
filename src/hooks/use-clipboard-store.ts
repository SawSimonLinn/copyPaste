
'use client';

import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {v4 as uuidv4} from 'uuid';
import {ClipboardItem, ClipboardItemContent} from '@/lib/clipboard-types';

interface ClipboardState {
  items: ClipboardItem[];
  addItem: (item: Omit<ClipboardItem, 'id'> | ClipboardItem) => void;
  updateItem: (item: ClipboardItem) => void;
  removeItem: (id: string) => void;
  reorderItems: (activeId: string, overId: string) => void;
}

const arrayMove = <T>(
  array: T[],
  from: number,
  to: number
): T[] => {
  const newArray = array.slice();
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};


// Helper to ensure data consistency
const sanitizeItem = (item: any): ClipboardItem | Omit<ClipboardItem, 'id'> => {
  const sanitizedContent = (item.content || []).map((c: any) => ({
    id: c.id || uuidv4(),
    type: c.type === 'link' ? 'link' : 'text',
    value: String(c.value || ''),
  })).filter((c: ClipboardItemContent) => c.value); // Filter out empty content

  if ('id' in item) {
    return {
      id: item.id,
      title: String(item.title || 'Untitled'),
      icon: String(item.icon || 'default'),
      content: sanitizedContent,
    };
  }
  return {
    title: String(item.title || 'Untitled'),
    icon: String(item.icon || 'default'),
    content: sanitizedContent,
  };
};

export const useClipboardStore = create<ClipboardState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: item => {
        const sanitizedItem = sanitizeItem(item);
        const newItem = 'id' in sanitizedItem ? sanitizedItem : {...sanitizedItem, id: uuidv4()};
        
        set(state => ({
          items: [newItem as ClipboardItem, ...state.items], // Add new items to the top
        }));
      },
      updateItem: item => {
        const sanitizedItem = sanitizeItem(item) as ClipboardItem;
        set(state => ({
          items: state.items.map(i => (i.id === sanitizedItem.id ? sanitizedItem : i)),
        }));
      },
      removeItem: id => {
        set(state => ({
          items: state.items.filter(item => item.id !== id),
        }));
      },
      reorderItems: (activeId, overId) => {
        set(state => {
          const oldIndex = state.items.findIndex(item => item.id === activeId);
          const newIndex = state.items.findIndex(item => item.id === overId);

          if (oldIndex === -1 || newIndex === -1) {
            return state;
          }
          return {
            items: arrayMove(state.items, oldIndex, newIndex),
          };
        });
      },
    }),
    {
      name: 'clipboard-storage', 
      storage: createJSONStorage(() => localStorage), 
      version: 2, // Increment version to trigger migration for multi-content
    }
  )
);

const isLink = (content: string): boolean => {
  if (!content) return false;
  try {
    const url = new URL(content.startsWith('http') ? content : `https://${content}`);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (e) {
    return false;
  }
};
