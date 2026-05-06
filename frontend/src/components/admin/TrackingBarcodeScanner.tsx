'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { normalizeTrackingCandidate, isLikelyDomesticTrackingNumber } from '@/lib/tracking-number';

interface TrackingBarcodeScannerProps {
  onConfirm: (value: string) => void;
}

type ScannerState = 'idle' | 'requesting' | 'scanning' | 'detected' | 'error';

function isDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return process.env.NODE_ENV === 'development';
}

export function TrackingBarcodeScanner({ onConfirm }: TrackingBarcodeScannerProps) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ScannerState>('idle');
  const [candidate, setCandidate] = useState('');
  const [ignored, setIgnored] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const readerRef = useRef<unknown>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    readerRef.current = null;
    if (isDebugEnabled()) console.log('[barcode-scanner] camera stopped');
  }, []);

  const startScanLoop = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    let lastCandidate = '';
    let lastCandidateTime = 0;

    const decode = async () => {
      if (!mountedRef.current || !videoRef.current || !streamRef.current) return;
      const video = videoRef.current;
      if (video.readyState < 2) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return;

      // ROI: center horizontal strip (85% width, 25% height)
      const roiW = Math.round(vw * 0.85);
      const roiH = Math.round(vh * 0.25);
      const roiX = Math.round((vw - roiW) / 2);
      const roiY = Math.round((vh - roiH) / 2);

      canvas.width = roiW;
      canvas.height = roiH;
      ctx?.drawImage(video, roiX, roiY, roiW, roiH, 0, 0, roiW, roiH);

      try {
        // Lazy-load ZXing
        if (!readerRef.current) {
          const { BrowserMultiFormatReader } = await import('@zxing/browser');
          readerRef.current = new BrowserMultiFormatReader();
        }
        const reader = readerRef.current as { decodeFromCanvas: (canvas: HTMLCanvasElement) => { getText: () => string } };
        const result = reader.decodeFromCanvas(canvas);

        if (result) {
          const raw = result.getText();
          const normalized = normalizeTrackingCandidate(raw);

          if (isLikelyDomesticTrackingNumber(normalized)) {
            const now = Date.now();
            if (normalized !== lastCandidate || now - lastCandidateTime > 300) {
              lastCandidate = normalized;
              lastCandidateTime = now;
              if (mountedRef.current) {
                setCandidate(normalized);
                setIgnored('');
                setState('detected');
                if (isDebugEnabled()) console.log('[barcode-scanner] candidate detected:', normalized);
              }
            }
          } else if (normalized.length > 0) {
            if (mountedRef.current) {
              setIgnored(normalized);
            }
          }
        }
      } catch {
        // Decode failure is normal when no barcode is visible
      }
    };

    scanIntervalRef.current = setInterval(decode, 350);
  }, []);

  const openScanner = useCallback(async () => {
    setOpen(true);
    setState('requesting');
    setCandidate('');
    setIgnored('');
    setErrorMsg('');

    // Check HTTPS / localhost
    if (typeof window !== 'undefined') {
      const loc = window.location;
      const isSecure = loc.protocol === 'https:' || loc.hostname === 'localhost' || loc.hostname === '127.0.0.1';
      if (!isSecure) {
        setState('error');
        setErrorMsg('摄像头功能需要 HTTPS 或 localhost 环境。');
        return;
      }
    }

    if (!navigator?.mediaDevices?.getUserMedia) {
      setState('error');
      setErrorMsg('当前浏览器不支持摄像头。');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (isDebugEnabled()) console.log('[barcode-scanner] camera opened');
      setState('scanning');
      startScanLoop();
    } catch (err) {
      if (!mountedRef.current) return;
      setState('error');
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('Permission') || msg.includes('NotAllowed')) {
        setErrorMsg('摄像头权限被拒绝，请在浏览器设置中允许，或继续手动输入快递单号。');
      } else {
        setErrorMsg('无法打开摄像头，请检查浏览器权限，或继续手动输入快递单号。');
      }
    }
  }, [startScanLoop]);

  const handleConfirm = useCallback(() => {
    if (!candidate) return;
    stopCamera();
    setOpen(false);
    setState('idle');
    onConfirm(candidate);
  }, [candidate, onConfirm, stopCamera]);

  const handleCancel = useCallback(() => {
    stopCamera();
    setOpen(false);
    setState('idle');
  }, [stopCamera]);

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleCancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return (
    <>
      {/* Camera trigger button */}
      <button
        type="button"
        onClick={openScanner}
        aria-label="扫描国内快递单号"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Camera className="h-4 w-4" />
      </button>

      {/* Scanner overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/90" role="dialog" aria-label="扫描国内快递单号">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-black/60 text-white">
            <div>
              <h3 className="text-base font-semibold">扫描国内快递单号</h3>
              <p className="text-xs text-white/70 mt-0.5">请将快递面单上的条形码放入绿色识别框内</p>
            </div>
            <button onClick={handleCancel} className="p-2 rounded-full hover:bg-white/10" aria-label="关闭">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Video area */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center">
            {state === 'requesting' && (
              <div className="text-white text-sm">正在请求摄像头权限...</div>
            )}
            {state === 'error' && (
              <div className="text-center px-6">
                <p className="text-red-400 text-sm">{errorMsg}</p>
                <button onClick={handleCancel} className="mt-4 px-4 py-2 rounded-md bg-white/10 text-white text-sm hover:bg-white/20">
                  返回手动输入
                </button>
              </div>
            )}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ display: (state === 'scanning' || state === 'detected') ? 'block' : 'none' }}
            />

            {/* Green scan region overlay */}
            {(state === 'scanning' || state === 'detected') && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="border-2 border-green-400/80 rounded-lg bg-green-400/10"
                  style={{ width: '85%', height: '25%' }}
                />
              </div>
            )}
          </div>

          {/* Results footer */}
          {(state === 'scanning' || state === 'detected') && (
            <div className="bg-black/80 px-4 py-4 space-y-3">
              {/* Candidate display */}
              <div className="min-h-[2rem]">
                {candidate ? (
                  <p className="text-green-400 text-sm font-mono">
                    当前识别：{candidate}
                  </p>
                ) : (
                  <p className="text-white/50 text-sm">暂未识别到有效运单号</p>
                )}
                {ignored && !candidate && (
                  <p className="text-yellow-400/70 text-xs mt-1">
                    已忽略疑似非运单号：{ignored}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 rounded-md border border-white/20 text-white text-sm hover:bg-white/10"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!candidate}
                  className="flex-1 px-4 py-2.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  确认填入
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
