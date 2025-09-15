
export interface ClipboardItemContent {
  id: string;
  type: 'link' | 'text';
  value: string;
}

export interface ClipboardItem {
  id: string;
  title: string;
  icon: string; // Could be a name from an icon library or a URL
  content: ClipboardItemContent[];
}
