
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ClipboardCopy,
  Pencil,
  Trash2,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';
import {
  ClipboardItem,
  ClipboardItemContent,
} from '@/lib/clipboard-types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ClipboardItemCardProps {
  item: ClipboardItem;
  onEdit: () => void;
  onDelete: () => void;
}

const getFaviconUrl = (url: string) => {
  try {
    const fullUrl = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `https://${url.split('/')[0]}`;
    const { hostname } = new URL(fullUrl);
    return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=64`;
  } catch (error) {
    console.error("Invalid URL for favicon:", url);
    return null;
  }
};

const CardIcon: React.FC<{ item: ClipboardItem }> = ({ item }) => {
  const hasLink = item.content.some(c => c.type === 'link');
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [faviconError, setFaviconError] = useState(false);

  useEffect(() => {
    if (hasLink) {
      const firstLink = item.content.find(c => c.type === 'link');
      if (firstLink) {
        const url = getFaviconUrl(firstLink.value);
        setFaviconUrl(url);
        setFaviconError(false); // Reset error state on item change
      }
    }
  }, [item, hasLink]);

  if (hasLink) {
    if (faviconUrl && !faviconError) {
      return (
        <Image
          src={faviconUrl}
          alt={`${item.title} favicon`}
          width={18}
          height={18}
          className="rounded-sm"
          onError={() => setFaviconError(true)}
        />
      );
    }
    // If favicon fails or isn't available, show generic link icon
    return <LinkIcon className="h-4 w-4 text-gray-500" />;
  }

  return <FileText className="h-4 w-4 text-gray-500" />;
};


export function ClipboardItemCard({
  item,
  onEdit,
  onDelete,
}: ClipboardItemCardProps) {

  const handleCopy = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        alert('Failed to copy content to clipboard.');
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <Card
      className="flex flex-col h-full shadow-md hover:shadow-lg transition-shadow duration-300 bg-card"
    >
      <CardHeader className="flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2 overflow-hidden flex-grow min-w-0">
            <div className="flex-shrink-0">
               <CardIcon item={item} />
            </div>
            <CardTitle className="text-base font-semibold truncate">
              {item.title}
            </CardTitle>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-grow flex flex-col gap-2 px-3 pb-3 min-h-0">
        <div className="space-y-2">
            {item.content.map(contentItem => (
                <div key={contentItem.id} className="flex items-center justify-between gap-2">
                     <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex-grow break-words font-body text-sm text-gray-600 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                                {contentItem.type === 'link' ? (
                                    <a href={contentItem.value.startsWith('http') ? contentItem.value : `https://${contentItem.value}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{contentItem.value}</a>
                                ) : (
                                    <p className="line-clamp-2">{contentItem.value}</p>
                                )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                            side="bottom"
                            className="max-w-xs break-all"
                            >
                            <p>{contentItem.value}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(contentItem.value)}
                        className="flex-shrink-0 h-7 w-7"
                    >
                        <ClipboardCopy className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
