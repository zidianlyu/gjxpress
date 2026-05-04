'use client';

import { Inbox, Search, Package, FileText } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: 'inbox' | 'search' | 'package' | 'file' | 'default';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  inbox: Inbox,
  search: Search,
  package: Package,
  file: FileText,
  default: Inbox,
};

export function EmptyState({
  title = '暂无数据',
  description = '当前没有可显示的内容',
  icon = 'default',
  action,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
