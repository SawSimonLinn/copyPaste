
'use client';

import React, {useState, useEffect} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import { Plus, Trash2, Link as LinkIcon, FileText } from 'lucide-react';
import {
  ClipboardItem,
  ClipboardItemContent,
} from '@/lib/clipboard-types';
import {v4 as uuidv4} from 'uuid';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

interface ClipboardItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ClipboardItem) => void;
  item: ClipboardItem | null;
}

const isLink = (value: string): boolean => {
    if (!value) return false;
    // Basic regex to check for something that looks like a URL
    const urlPattern = new RegExp('^(https:\\/\\/|http:\\/\\/|www\\.)|([a-zA-Z0-9-]+\\.[a-zA-Z]{2,})');
    return urlPattern.test(value);
};


export function ClipboardItemDialog({
  isOpen,
  onClose,
  onSave,
  item,
}: ClipboardItemDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ClipboardItemContent[]>([]);

  useEffect(() => {
    if (isOpen) {
        if (item) {
            setTitle(item.title);
            setContent(item.content.map(c => ({...c}))); // deep copy
        } else {
            setTitle('');
            setContent([{id: uuidv4(), type: 'text', value: ''}]);
        }
    }
  }, [isOpen, item]);

  const handleSave = () => {
    const filteredContent = content.filter(c => c.value.trim());
    if (!title.trim() || filteredContent.length === 0) {
       alert('Please provide a title and at least one content item.');
      return;
    }

    const savedItem: ClipboardItem = {
      id: item?.id || uuidv4(),
      title,
      icon: 'default',
      content: filteredContent,
    };
    onSave(savedItem);
  };
  
  const updateContent = (id: string, value: string) => {
    setContent(currentContent => currentContent.map(c => 
        c.id === id ? {...c, value: value, type: isLink(value) ? 'link' : 'text'} : c
    ));
  };
  
  const addContent = (type: 'text' | 'link') => {
    setContent(currentContent => [...currentContent, {id: uuidv4(), type, value: ''}]);
  };

  const removeContent = (id: string) => {
    setContent(currentContent => currentContent.filter(c => c.id !== id));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Snippet' : 'Create Snippet'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g., Social Media Links, Boilerplate Code"
              className="text-base"
            />
          </div>
          
          <Separator />

          <div className="space-y-4">
              <Label className="text-base font-medium">Content</Label>
              <div className="space-y-3 rounded-md border p-3">
                {content.map((contentItem) => (
                  <div key={contentItem.id} className="flex items-center gap-3">
                    <div className="text-muted-foreground">
                        {contentItem.type === 'link' ? <LinkIcon className="h-5 w-5"/> : <FileText className="h-5 w-5" />}
                    </div>
                     <Textarea
                        id={`content-${contentItem.id}`}
                        value={contentItem.value}
                        onChange={e => updateContent(contentItem.id, e.target.value)}
                        placeholder={contentItem.type === 'link' ? 'https://example.com' : 'Enter text...'}
                        className="flex-grow min-h-[40px] text-base"
                        rows={contentItem.type === 'text' && contentItem.value.split('\n').length > 1 ? 3 : 1}
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeContent(contentItem.id)} className="shrink-0 text-muted-foreground hover:text-destructive" disabled={content.length <= 1}>
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>  
                ))}
              </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => addContent('text')}>
                <Plus className="mr-2 h-4 w-4" /> Add Note
            </Button>
             <Button variant="outline" size="sm" onClick={() => addContent('link')}>
                <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Snippet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
