'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, ShieldCheck, ZoomIn, ZoomOut, RotateCcw, AlertCircle, FileText } from 'lucide-react';
import { formatCurrency, formatKg, formatDate } from '@/lib/utils';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  proofUrl?: string | null;
  studentName: string;
  classId?: string;
  moneyAmount?: number;
  equivalentKg?: number;
  createdAt?: string;
  recordedBy?: string;
  notes?: string;
}

export default function PaymentProofModal({
  isOpen,
  onClose,
  proofUrl,
  studentName,
  classId,
  moneyAmount,
  equivalentKg,
  createdAt,
  recordedBy,
  notes,
}: PaymentProofModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Reset zoom on open
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
    }
  }, [isOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleDownload() {
    if (!proofUrl) return;
    const a = document.createElement('a');
    a.href = proofUrl;
    const sanitizedStudent = studentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    a.download = `payment-proof-${sanitizedStudent}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-[#e6e2d8] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#f0ede6] bg-[#fbfaf7] flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black font-headline text-[#0a241b] truncate">
                Payment Verification Proof
              </h3>
              <p className="text-xs text-[#526359] truncate">
                Monetary contribution recorded for <strong className="text-[#0a241b]">{studentName}</strong>
                {classId ? ` (${classId})` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {proofUrl && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#155e42] bg-white border border-[#e6e2d8] hover:bg-[#fbfaf7] rounded-xl transition-colors shadow-2xs"
                title="Download Receipt"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audit Details Strip */}
        <div className="px-5 py-3 bg-emerald-50/60 border-b border-emerald-100/60 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-4">
            {moneyAmount !== undefined && (
              <div>
                <span className="text-gray-500 text-[11px] block">Amount Paid</span>
                <span className="font-black text-emerald-800 text-sm">
                  {formatCurrency(moneyAmount)}
                </span>
              </div>
            )}
            {equivalentKg !== undefined && (
              <div>
                <span className="text-gray-500 text-[11px] block">Impact Added</span>
                <span className="font-black text-[#155e42] text-sm">
                  +{formatKg(equivalentKg)}
                </span>
              </div>
            )}
          </div>

          <div className="text-right text-[11px] text-gray-500">
            {createdAt && <div>Recorded: {formatDate(createdAt)}</div>}
            {recordedBy && <div className="truncate max-w-[200px]">By: {recordedBy}</div>}
          </div>
        </div>

        {notes && (
          <div className="px-5 py-2 bg-[#fbfaf7] border-b border-[#f0ede6] text-xs text-[#526359] flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="truncate"><strong>Note:</strong> {notes}</span>
          </div>
        )}

        {/* Screenshot Viewport */}
        <div className="flex-1 min-h-[300px] max-h-[56vh] bg-[#1a201c] p-4 flex items-center justify-center overflow-auto relative">
          {proofUrl ? (
            <div
              className="transition-transform duration-150 flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofUrl}
                alt={`Payment proof for ${studentName}`}
                className="max-h-[50vh] w-auto max-w-full rounded-lg shadow-lg object-contain cursor-zoom-in"
                onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
              />
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-500" />
              <p className="text-xs font-semibold">No payment screenshot attached to this record.</p>
            </div>
          )}

          {/* Zoom controls */}
          {proofUrl && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-xs rounded-xl p-1 text-white text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                className="p-1 hover:bg-white/20 rounded-lg"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 font-mono text-[11px]">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                className="p-1 hover:bg-white/20 rounded-lg"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:bg-white/20 rounded-lg ml-0.5 border-l border-white/20 pl-1.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#f0ede6] flex items-center justify-between text-xs">
          <span className="text-[11px] text-gray-500">
            Encrypted & compressed authentic record stored in Dhanyadhan database.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#155e42] hover:bg-[#0a241b] text-white font-bold transition-colors shadow-2xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
