'use client';

import { X, ExternalLink } from 'lucide-react';

interface ImagePreviewModalProps {
  url: string;
  onClose: () => void;
}

export function ImagePreviewModal({ url, onClose }: ImagePreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="absolute -top-3 -right-3 flex gap-1.5 z-10">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-full bg-white shadow-lg text-gray-700 hover:text-gray-900"
            title="在新标签页打开"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button onClick={onClose} className="p-1.5 rounded-full bg-white shadow-lg text-gray-700 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>
        <img
          src={url}
          alt="预览"
          className="max-w-full max-h-[85vh] rounded-lg object-contain"
          onError={(e) => { (e.target as HTMLImageElement).alt = '图片加载失败'; }}
        />
      </div>
    </div>
  );
}
