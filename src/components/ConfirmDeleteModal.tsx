import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  warningText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  itemName,
  warningText = 'This entry will be permanently deleted and cannot be recovered. (এই এন্ট্রি মুছে ফেললে আর পুনরুদ্ধার করা যাবে না।)',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Confirm Deletion (মুছে ফেলতে নিশ্চিত করুন)
            </p>
          </div>
        </div>

        {itemName && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold flex items-center gap-2">
            <span className="text-slate-400 font-normal">Item (আইটেম):</span>
            <span className="text-rose-700 truncate">{itemName}</span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-rose-600 bg-rose-50/70 p-3 rounded-xl border border-rose-100 font-semibold mb-6 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{warningText}</span>
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-2xl text-slate-700 hover:bg-slate-100 font-bold text-sm transition active:scale-95"
          >
            Cancel (বাতিল)
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Yes, Delete (হ্যাঁ, মুছে ফেলুন)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
