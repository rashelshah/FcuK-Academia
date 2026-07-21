'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download, X, Loader2 } from 'lucide-react';
import type { RawTimetableItem } from '@/lib/server/academia';
import ThemedTimetableGrid from './ThemedTimetableGrid';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimetableDownloadModal({
  isOpen,
  onClose,
  timetable
}: {
  isOpen: boolean;
  onClose: () => void;
  timetable: RawTimetableItem[];
}) {
  const [isCapturing, setIsCapturing] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.2); // Fallback

  useEffect(() => {
    if (!isOpen) return;

    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth;
        // The table is 1650px wide. We add a little padding (32px).
        setPreviewScale(Math.min(1, (containerWidth - 32) / 1650));
      }
    };

    const timer = setTimeout(updateScale, 10);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateScale);
    };
  }, [isOpen]);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    try {
      setIsCapturing(true);
      
      const width = captureRef.current.scrollWidth;
      const height = captureRef.current.scrollHeight;
      
      const image = await toPng(captureRef.current, {
        pixelRatio: 2, // High resolution
        backgroundColor: 'transparent',
        width,
        height,
      });
      const link = document.createElement('a');
      link.href = image;
      link.download = 'timetable.png';
      link.click();
    } catch (err) {
      console.error('Failed to capture timetable', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="theme-card relative z-10 w-full max-w-[1000px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="font-headline text-xl font-bold text-on-surface">Download Timetable</h2>
                <p className="text-sm text-on-surface-variant">A high-resolution image using your current theme.</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview area - strictly contained with absolute margins to guarantee centering */}
            <div 
              ref={previewContainerRef}
              className="relative w-full overflow-hidden bg-surface-variant/20 h-[250px] sm:h-[400px]"
            >
              <div 
                className="absolute top-1/2 left-1/2 pointer-events-none"
                style={{ 
                  width: '1650px',
                  height: '800px',
                  marginLeft: '-825px', // Exact half of 1650px
                  marginTop: '-400px',  // Exact half of 800px
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'center center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div className="w-[1650px]">
                  {/* Visual preview of the component */}
                  <ThemedTimetableGrid timetable={timetable} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t bg-surface/50 p-6 backdrop-blur-md" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={onClose}
                className="rounded-full px-6 py-2.5 font-headline text-sm font-bold text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDownload}
                disabled={isCapturing}
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 font-headline text-sm font-bold text-on-primary hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                <span>{isCapturing ? 'Generating...' : 'Save as Image'}</span>
              </button>
            </div>
          </motion.div>

          {/* Off-screen actual element for capturing without width constraints */}
          <div className="fixed top-[9999px] left-[9999px] -z-50 pointer-events-none" style={{ opacity: 0.001 }}>
            <div ref={captureRef} className="w-max inline-block">
              <ThemedTimetableGrid timetable={timetable} />
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
