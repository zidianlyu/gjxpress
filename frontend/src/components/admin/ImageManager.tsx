'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Camera, X, Loader2, ImageIcon, Trash2 } from 'lucide-react';
import { ImagePreviewModal } from '@/components/common/ImagePreviewModal';

// ─── Local file images (pre-upload) ─────────────────────────

interface LocalImageListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function LocalImageList({ files, onRemove }: LocalImageListProps) {
  const [previewIdx, setPreviewIdx] = useState<number | null>(null);

  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  // Revoke old URLs when files change
  const prevUrlsRef = useRef<string[]>([]);
  useEffect(() => {
    const prev = prevUrlsRef.current;
    prevUrlsRef.current = previews;
    return () => { prev.forEach(u => URL.revokeObjectURL(u)); };
  }, [previews]);

  if (files.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {previews.map((url, i) => (
          <div key={i} className="relative group">
            <button
              type="button"
              onClick={() => setPreviewIdx(i)}
              className="block w-full aspect-square rounded-md border overflow-hidden bg-muted hover:opacity-80 transition-opacity"
            >
              <img src={url} alt={`待上传 ${i + 1}`} className="w-full h-full object-cover" />
            </button>
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 md:opacity-0 max-md:opacity-100 transition-opacity hover:bg-red-600"
              title="删除此图片"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">已选择 {files.length} 张图片，点击图片可预览</p>
      {previewIdx !== null && previews[previewIdx] && (
        <ImagePreviewModal url={previews[previewIdx]} onClose={() => setPreviewIdx(null)} />
      )}
    </>
  );
}

// ─── Image picker button ────────────────────────────────────

interface ImagePickerProps {
  onSelect: (files: File[]) => void;
  disabled?: boolean;
  label?: string;
}

export function ImagePicker({ onSelect, disabled, label }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelect(Array.from(e.target.files));
      e.target.value = '';
    }
  }, [onSelect]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
      >
        <Camera className="h-4 w-4" />
        {label || '拍照 / 上传图片'}
      </button>
    </div>
  );
}

// ─── Server image grid (uploaded images) ────────────────────

interface ServerImageGridProps {
  imageUrls: string[];
  onDelete: (url: string) => Promise<void>;
  onUpload?: (file: File) => Promise<void>;
  saving?: boolean;
  title?: string;
}

export function ServerImageGrid({ imageUrls, onDelete, onUpload, saving, title }: ServerImageGridProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const [confirmDeleteUrl, setConfirmDeleteUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteUrl) return;
    setDeletingUrl(confirmDeleteUrl);
    try {
      await onDelete(confirmDeleteUrl);
    } finally {
      setDeletingUrl(null);
      setConfirmDeleteUrl(null);
    }
  };

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !onUpload) return;
    const files = Array.from(e.target.files);
    e.target.value = '';
    setUploading(true);
    setUploadError('');
    let failCount = 0;
    for (const file of files) {
      try {
        await onUpload(file);
      } catch {
        failCount++;
      }
    }
    if (failCount > 0) {
      setUploadError(`${failCount} 张图片上传失败`);
    }
    setUploading(false);
  };

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h2 className="font-semibold flex items-center gap-2">
        <ImageIcon className="h-4 w-4" /> {title || '图片'} ({imageUrls.length})
      </h2>

      {imageUrls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative group">
              <button
                type="button"
                onClick={() => setPreviewUrl(url)}
                className="block w-full aspect-square rounded-md border overflow-hidden bg-muted hover:opacity-80 transition-opacity"
              >
                <img
                  src={url}
                  alt={`图片 ${i + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteUrl(url)}
                disabled={saving || !!deletingUrl}
                className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 max-md:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                title="删除图片"
              >
                {deletingUrl === url ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">暂无图片</p>
      )}

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

      {onUpload && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            onChange={handleUploadFiles}
            className="hidden"
            disabled={uploading || saving}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 w-full sm:w-auto justify-center"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {uploading ? '上传中...' : '继续上传图片'}
          </button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmDeleteUrl(null)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <h3 className="font-semibold">确认删除图片</h3>
            </div>
            <p className="text-sm text-muted-foreground">删除后图片将不可恢复，是否继续？</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDeleteUrl(null)} className="px-4 py-2 rounded-md border text-sm hover:bg-muted">取消</button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deletingUrl}
                className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {deletingUrl ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewUrl && (
        <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}
    </div>
  );
}
